import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setSessionExpiredHandler } from '../services/api';
import { notificationService } from '../services/notificationService';

type MiningStatus = 'active' | 'inactive';

interface Duration {
  h: number;
  label: string;
  seconds: number;
}

interface MultiplierOption {
  value: number;
  label: string;
  requiresAd: boolean;
}

interface MiningConfig {
  durations: Duration[];
  multiplierOptions: MultiplierOption[];
  baseRate: number;
}

export interface AdRewardStatus {
  claimedCount: number;
  remainingClaims: number;
  maxClaims: number;
  canClaim: boolean;
  lastClaimTime?: string | null;
}

interface MiningContextType {
  walletAddress: string;
  setWalletAddress: (addr: string) => Promise<void>;
  totalBalance: number;
  walletBalance: number;
  refreshBalance: () => Promise<void>;
  miningStatus: MiningStatus;
  currentMultiplier: number;
  selectedDuration: number; // seconds
  remainingSeconds: number;
  liveTokens: number;
  isLoading: boolean;
  hasUnclaimedRewards: boolean;
  config: MiningConfig;
  configLoading: boolean;
  startMining: (durationSeconds: number) => Promise<void>;
  stopMining: () => Promise<void>;
  // Ad reward popup state
  showAdRewardPopup: boolean;
  adRewardTokens: number;
  setAdRewardPopup: (show: boolean, tokens?: number) => void;

  upgradeMultiplier: () => Promise<void>;
  claimRewards: () => Promise<number>;
  logout: () => Promise<void>;
  setLocalBalance: (balance: number) => void;
  adRewardStatus: AdRewardStatus;
}

const BASE_RATE = 0.01; // tokens/sec
const MAX_MULTIPLIER = 6;
const STORAGE_KEY = 'MINING_STATE_V1';

type Persisted = {
  walletAddress: string;
  miningStatus: MiningStatus;
  selectedDuration: number;
  multiplier: number;
  startTimestamp: number; // ms epoch
  liveTokens: number;
  lastTick: number; // ms epoch
};

const MiningContext = createContext<MiningContextType>({} as MiningContextType);
export const useMining = () => useContext(MiningContext);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [walletAddress, setWalletAddressState] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [miningStatus, setMiningStatus] = useState<MiningStatus>('inactive');
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [liveTokens, setLiveTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnclaimedRewards, setHasUnclaimedRewards] = useState(false);
  const [config, setConfig] = useState<MiningConfig>({
    durations: [],
    multiplierOptions: [],
    baseRate: 0.01,
  });
  const [configLoading, setConfigLoading] = useState(true);

  // Ad reward popup state
  const [showAdRewardPopup, setShowAdRewardPopup] = useState(false);
  const [adRewardTokens, setAdRewardTokens] = useState(0);

  const [adRewardStatus, setAdRewardStatus] = useState<AdRewardStatus>({
    claimedCount: 0,
    remainingClaims: 6,
    maxClaims: 6,
    canClaim: true,
  });

  // Wrapper to persist wallet address when set
  const setWalletAddress = async (addr: string) => {
    console.log('💼 Setting wallet address:', addr);
    setWalletAddressState(addr);
    // Persist immediately
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        walletAddress: addr,
        miningStatus: 'inactive',
        selectedDuration: 0,
        multiplier: 1,
        startTimestamp: Date.now(),
        liveTokens: 0,
        lastTick: Date.now(),
      }),
    );
  };

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const effectiveRate = useMemo(() => {
    // Correct formula: Effective Rate = Base Rate × Multiplier
    // Example: 0.01 * 3 = 0.03 tokens/sec
    return config.baseRate * currentMultiplier;
  }, [currentMultiplier, config.baseRate]);

  const effectiveTokens = (elapsedSeconds: number, multiplier: number) => {
    // Correct calculation: baseRate * multiplier * seconds
    // Example: 0.01 * 3 * 14400 = 432 tokens for 4 hours with 3x multiplier
    const rate = config.baseRate * multiplier;
    return rate * elapsedSeconds;
  };

  const persist = async (patch: Partial<Persisted> = {}, force = false) => {
    // CRITICAL: Prevent overwriting saved state with empty default state if app hasn't fully loaded
    if (isLoading && !force) {
      console.log('⏳ App loading, skipping persistence to prevent data loss');
      return;
    }

    const data: Persisted = {
      walletAddress,
      miningStatus,
      selectedDuration,
      multiplier: currentMultiplier,
      startTimestamp: Date.now() - (selectedDuration - remainingSeconds) * 1000,
      liveTokens,
      lastTick: Date.now(),
    };
    const finalData = { ...data, ...patch };
    console.log('💾 Persisting data:', finalData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
  };

  const hydrate = async () => {
    console.log('🔄 Hydrating app state...');

    try {
      console.log('📦 Reading from AsyncStorage...');
      const raw = await AsyncStorage.getItem(STORAGE_KEY);

      if (!raw) {
        console.log('❌ No saved state found - first time user');
        setIsLoading(false);
        return;
      }

      console.log('✅ Saved state found, parsing...');
      const saved: Persisted = JSON.parse(raw);
      const walletAddr = saved.walletAddress || '';
      console.log('💼 Wallet address found:', walletAddr);
      setWalletAddressState(walletAddr);

      // Load local state immediately (don't wait for backend)
      console.log('📱 Loading local state immediately...');
      setMiningStatus(saved.miningStatus);
      setSelectedDuration(saved.selectedDuration);
      setCurrentMultiplier(saved.multiplier || 1);
      setLiveTokens(saved.liveTokens || 0);

      // If mining was active, restart the ticker with local data
      if (saved.miningStatus === 'active') {
        const elapsed = Math.floor((Date.now() - saved.startTimestamp) / 1000);
        const rem = Math.max(saved.selectedDuration - elapsed, 0);
        setRemainingSeconds(rem);

        if (rem > 0) {
          console.log('⛏️ Resuming active mining session...');
          tickStart(
            saved.startTimestamp,
            saved.selectedDuration,
            saved.multiplier,
            0,
          );
        } else {
          console.log('⏰ Mining completed while app was closed');
          setMiningStatus('inactive');
          setHasUnclaimedRewards(true);
        }
      }

      // Sync with backend in background (non-blocking)
      if (walletAddr) {
        console.log('🌐 Starting background sync with backend...');

        // Don't await - let this happen in background
        (async () => {
          try {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Backend timeout')), 5000),
            );

            const res = (await Promise.race([
              api.get(`/api/users/${walletAddr}`),
              timeoutPromise,
            ])) as any;

            console.log('✅ Backend sync complete:', res.data);
            setTotalBalance(res.data.totalBalance ?? 0);
            setWalletBalance(
              res.data.walletBalance ?? res.data.totalBalance ?? 0,
            );

            // Update mining status if backend has different data
            if (
              res.data.miningStatus === 'active' &&
              res.data.miningStartTime
            ) {
              const startTs = new Date(res.data.miningStartTime).getTime();
              const duration = (res.data.selectedHour ?? 1) * 3600;
              const multiplier = res.data.multiplier ?? 1;
              const elapsed = Math.floor((Date.now() - startTs) / 1000);
              const rem = Math.max(duration - elapsed, 0);

              // Only update if significantly different from local state
              if (Math.abs(saved.startTimestamp - startTs) > 5000) {
                console.log(
                  '🔄 Backend has different mining data, updating...',
                );
                setMiningStatus('active');
                setSelectedDuration(duration);
                setRemainingSeconds(rem);
                setCurrentMultiplier(multiplier);

                if (rem > 0) {
                  const cappedElapsed = Math.min(elapsed, duration);
                  const elapsedTokens = effectiveTokens(
                    cappedElapsed,
                    multiplier,
                  );
                  setLiveTokens(elapsedTokens);
                  tickStart(startTs, duration, multiplier, 0);
                  setHasUnclaimedRewards(false);
                } else {
                  setMiningStatus('inactive');
                  const elapsedTokens = effectiveTokens(duration, multiplier);
                  setLiveTokens(elapsedTokens);
                  setHasUnclaimedRewards(true);
                }
              }
            } else if (
              res.data.miningStatus === 'inactive' &&
              saved.miningStatus === 'active'
            ) {
              console.log(
                '🛑 Backend says mining stopped, updating local state',
              );
              setMiningStatus('inactive');
              setHasUnclaimedRewards(false);
            }
          } catch (error) {
            console.warn(
              '⚠️ Background sync failed (using local data):',
              error,
            );
          }
        })();
      }
    } catch (error) {
      console.error('❌ Error during hydration:', error);
      setIsLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      console.log('🔧 Fetching mining config from backend...');
      const res = await api.get('/api/config');
      setConfig({
        durations: res.data.durations,
        multiplierOptions: res.data.multiplierOptions,
        baseRate: res.data.baseRate,
      });
      console.log('✅ Config loaded:', res.data);
    } catch (error) {
      console.error('❌ Failed to fetch config:', error);
      // Use default config if fetch fails
      setConfig({
        durations: [
          { h: 1, label: '1 Hour', seconds: 3600 },
          { h: 2, label: '2 Hours', seconds: 7200 },
          { h: 4, label: '4 Hours', seconds: 14400 },
          { h: 12, label: '12 Hours', seconds: 43200 },
          { h: 24, label: '24 Hours', seconds: 86400 },
        ],
        multiplierOptions: [
          { value: 1, label: '1×', requiresAd: false },
          { value: 2, label: '2×', requiresAd: true },
          { value: 3, label: '3×', requiresAd: true },
          { value: 4, label: '4×', requiresAd: true },
          { value: 5, label: '5×', requiresAd: true },
          { value: 6, label: '6×', requiresAd: true },
        ],
        baseRate: 0.01,
      });
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 MiningContext initializing...');

    // Register auto-logout handler
    console.log('🔌 Registering session expiry handler...');
    setSessionExpiredHandler(() => {
      console.log('🚪 Session expired (User deleted), logging out...');
      logout();
    });

    // Run both in parallel and don't wait for config to finish loading
    fetchConfig(); // Non-blocking

    // Set a maximum timeout for hydration to prevent infinite splash screen
    const maxLoadTimeout = setTimeout(() => {
      console.warn('⚠️ Hydration timeout (500ms) - forcing app to load');
      setIsLoading(false);
    }, 500); // Reduced to 500ms for faster loading

    // Start hydration
    hydrate()
      .then(() => {
        console.log('✅ Hydration completed successfully');
        setIsLoading(false); // Explicitly set loading to false on success
      })
      .catch(err => {
        console.error('❌ Hydration error:', err);
        setIsLoading(false); // Ensure loading stops on error
      })
      .finally(() => {
        console.log('🏁 Hydration finally block - clearing timeout');
        clearTimeout(maxLoadTimeout);
      });

    return () => {
      console.log('🧹 Cleaning up hydration timeout');
      clearTimeout(maxLoadTimeout);
    };
  }, []);

  // Real-time sync with backend every 2 seconds for immediate updates
  useEffect(() => {
    if (!walletAddress) return;

    const syncWithBackend = async () => {
      try {
        const res = await api.get(`/api/users/${walletAddress}`);

        // Update balance
        setTotalBalance(res.data.totalBalance ?? 0);
        setWalletBalance(res.data.walletBalance ?? res.data.totalBalance ?? 0);

        if (res.data.adRewardStatus) {
          setAdRewardStatus(res.data.adRewardStatus);
        }

        // Sync mining status
        if (res.data.miningStatus === 'active' && res.data.miningStartTime) {
          const startTs = new Date(res.data.miningStartTime).getTime();
          const duration = (res.data.selectedHour ?? 1) * 3600;
          const multiplier = res.data.multiplier ?? 1;
          const elapsed = Math.floor((Date.now() - startTs) / 1000);
          const rem = Math.max(duration - elapsed, 0);

          // Update mining state if status changed or multiplier changed
          if (miningStatus !== 'active' || currentMultiplier !== multiplier) {
            console.log('🔄 Syncing mining state from backend...');
            setMiningStatus('active');
            setSelectedDuration(duration);
            setCurrentMultiplier(multiplier);
            setHasUnclaimedRewards(false);

            if (rem > 0) {
              const elapsedTokens = effectiveTokens(elapsed, multiplier);
              setLiveTokens(elapsedTokens);
              setRemainingSeconds(rem);
              tickStart(startTs, duration, multiplier, 0);
            } else {
              // Mining finished but not claimed
              setMiningStatus('inactive');
              // Use full duration for completed mining
              const elapsedTokens = effectiveTokens(duration, multiplier);
              setLiveTokens(elapsedTokens);
              setRemainingSeconds(0);
              setHasUnclaimedRewards(true);
            }
          } else if (miningStatus === 'active') {
            // Already mining - check if backend startTime or duration changed
            // This happens when admin changes mining session from backend
            const currentStartTs =
              Date.now() - (selectedDuration - remainingSeconds) * 1000;
            const timeDiff = Math.abs(currentStartTs - startTs);
            const durationChanged = selectedDuration !== duration;

            // If backend data changed significantly (more than 5 seconds or duration changed)
            // restart the ticker with new backend data
            if (timeDiff > 5000 || durationChanged) {
              setSelectedDuration(duration);
              setCurrentMultiplier(multiplier);

              if (rem > 0) {
                const cappedElapsed = Math.min(elapsed, duration);
                const elapsedTokens = effectiveTokens(
                  cappedElapsed,
                  multiplier,
                );
                setLiveTokens(elapsedTokens);
                setRemainingSeconds(rem);
                // Restart ticker with new backend data
                tickStart(startTs, duration, multiplier, 0);
              } else {
                // Mining finished
                if (intervalRef.current) clearInterval(intervalRef.current);
                setMiningStatus('inactive');
                const elapsedTokens = effectiveTokens(duration, multiplier);
                setLiveTokens(elapsedTokens);
                setRemainingSeconds(0);
                setHasUnclaimedRewards(true);
                console.log('⏰ Mining completed during sync!');
              }
            }
            // Otherwise, let the local ticker continue smoothly without interference
          }
        } else if (
          res.data.miningStatus === 'inactive' &&
          miningStatus === 'active'
        ) {
          // Backend says mining stopped, sync local state
          console.log('🔄 Mining stopped on backend, syncing...');
          if (intervalRef.current) clearInterval(intervalRef.current);
          setMiningStatus('inactive');
          setLiveTokens(0);
          setCurrentMultiplier(1);
          setHasUnclaimedRewards(false);
        }
      } catch (error) {
        console.error('❌ Failed to sync with backend:', error);
      }
    };

    // Initial sync
    syncWithBackend();

    // Sync every 2 seconds for near real-time updates
    syncIntervalRef.current = setInterval(syncWithBackend, 2000);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [walletAddress, miningStatus, currentMultiplier]);

  const tickStart = (
    startTs: number,
    duration: number,
    multiplier: number,
    startTokens: number,
  ) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Set initial values immediately
    const now = Date.now();
    const elapsed = Math.floor((now - startTs) / 1000);
    const rem = Math.max(duration - elapsed, 0);
    setRemainingSeconds(rem);
    // Cap elapsed time at duration to prevent tokens from growing after timer stops
    const cappedElapsed = Math.min(elapsed, duration);
    const elapsedTokens = effectiveTokens(cappedElapsed, multiplier);
    setLiveTokens(startTokens + elapsedTokens);

    // Then start the interval
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTs) / 1000);
      const rem = Math.max(duration - elapsed, 0);
      setRemainingSeconds(rem);

      // Cap elapsed time at duration to prevent tokens from growing after timer stops
      const cappedElapsed = Math.min(elapsed, duration);

      // add tokens for this second
      setLiveTokens(() => {
        const elapsedTokens = effectiveTokens(cappedElapsed, multiplier);
        return startTokens + elapsedTokens;
      });

      if (rem <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMiningStatus('inactive');
        setHasUnclaimedRewards(true);
        console.log('⏰ Mining completed! Rewards ready to claim.');

        // Show notification when mining completes
        notificationService.displayImmediateNotification(
          '⛏️ Mining Complete!',
          'Your mining session has finished. Tap to claim your rewards!',
        );
      }
    }, 1000);
  };

  const refreshBalance = async () => {
    if (!walletAddress) return;
    console.log('🔄 Fetching balance for:', walletAddress);
    const res = await api.get(`/api/users/${walletAddress}`);
    console.log('📊 Balance response:', res.data);
    console.log('💰 Setting totalBalance to:', res.data.totalBalance ?? 0);
    setTotalBalance(res.data.totalBalance ?? 0);
    setWalletBalance(res.data.walletBalance ?? res.data.totalBalance ?? 0);

    if (res.data.adRewardStatus) {
      setAdRewardStatus(res.data.adRewardStatus);
    }

    // Fetch mining status from database
    if (res.data.miningStatus) {
      setMiningStatus(res.data.miningStatus);
      setCurrentMultiplier(res.data.multiplier ?? 1);

      // If mining is active, sync with server
      if (res.data.miningStatus === 'active' && res.data.miningStartTime) {
        const startTs = new Date(res.data.miningStartTime).getTime();
        const duration = (res.data.selectedHour ?? 1) * 3600;
        const elapsed = Math.floor((Date.now() - startTs) / 1000);
        const rem = Math.max(duration - elapsed, 0);

        setSelectedDuration(duration);
        setRemainingSeconds(rem);

        if (rem > 0) {
          const elapsedTokens = effectiveTokens(
            elapsed,
            res.data.multiplier ?? 1,
          );
          setLiveTokens(elapsedTokens);
          tickStart(startTs, duration, res.data.multiplier ?? 1, 0);
        } else {
          setMiningStatus('inactive');
        }
      }
    }
  };

  const startMining = async (durationSeconds: number) => {
    if (!walletAddress) throw new Error('No wallet');

    // Prevent starting new mining if there are unclaimed rewards
    if (hasUnclaimedRewards) {
      throw new Error(
        'Please claim your previous rewards before starting new mining',
      );
    }

    // Use client timestamp to avoid network delay issues
    const clientStartTs = Date.now();

    // Backend records authoritative session
    const res = await api.post('/api/mining/start', {
      walletAddress,
      selectedHour: Math.round(durationSeconds / 3600),
      multiplier: currentMultiplier,
    });

    // Use client timestamp for immediate accuracy
    setSelectedDuration(durationSeconds);
    setRemainingSeconds(durationSeconds);
    setLiveTokens(0);
    setMiningStatus('active');
    setHasUnclaimedRewards(false);
    tickStart(clientStartTs, durationSeconds, currentMultiplier, 0);

    // Schedule notification for when mining completes
    await notificationService.scheduleMiningCompleteNotification(
      durationSeconds,
    );

    await persist({
      startTimestamp: clientStartTs,
      selectedDuration: durationSeconds,
      miningStatus: 'active',
      multiplier: currentMultiplier,
      liveTokens: 0,
    }, true); // Force persist
  };

  const stopMining = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMiningStatus('inactive');
    setCurrentMultiplier(1); // Reset multiplier to 1

    // Cancel scheduled notification
    await notificationService.cancelMiningNotification();

    await api.post('/api/mining/stop', { walletAddress });
    await persist({ miningStatus: 'inactive', multiplier: 1 }, true); // Force persist
  };

  const upgradeMultiplier = async () => {
    if (currentMultiplier >= MAX_MULTIPLIER) return;
    const res = await api.put('/api/mining/upgrade', { walletAddress });
    const newMult = res.data.multiplier as number;
    setCurrentMultiplier(newMult);

    // If mining is active, restart the ticker with the new multiplier
    if (miningStatus === 'active' && selectedDuration > 0) {
      const startTs = Date.now() - (selectedDuration - remainingSeconds) * 1000;
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      const currentTokens = effectiveTokens(elapsed, currentMultiplier);

      // Restart ticker with new multiplier, preserving current progress
      tickStart(startTs, selectedDuration, newMult, 0);
    }

    await persist({ multiplier: newMult }, true); // Force persist
  };

  const claimRewards = async () => {
    const res = await api.post('/api/mining/claim', { walletAddress });
    // Server recomputes and returns awarded tokens to avoid client tampering
    const { awarded } = res.data;
    setLiveTokens(0);
    setMiningStatus('inactive');
    setCurrentMultiplier(1); // Reset multiplier to 1 after claiming
    setHasUnclaimedRewards(false); // Clear unclaimed rewards flag

    // Cancel any pending notifications
    await notificationService.cancelMiningNotification();

    await refreshBalance();
    await persist({ miningStatus: 'inactive', liveTokens: 0, multiplier: 1 }, true); // Force persist
    return awarded as number;
  };

  const setAdRewardPopup = (show: boolean, tokens: number = 0) => {
    console.log(`🎉 Setting ad reward popup: ${show}, tokens: ${tokens}`);
    setShowAdRewardPopup(show);
    setAdRewardTokens(tokens);
  };

  const logout = async () => {
    console.log('🚪 Logging out...');

    // Stop all intervals (mining continues on backend)
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    // Clear only local state (backend mining session and balance remain intact)
    setWalletAddressState('');
    setTotalBalance(0);
    setWalletBalance(0);
    setMiningStatus('inactive');
    setCurrentMultiplier(1);
    setSelectedDuration(0);
    setRemainingSeconds(0);
    setLiveTokens(0);
    setHasUnclaimedRewards(false);

    // Clear ad reward popup state
    setShowAdRewardPopup(false);
    setAdRewardTokens(0);

    // Clear AsyncStorage
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('✅ Logged out successfully - mining continues on backend');
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', async nextState => {
      if (
        appState.current.match(/active/) &&
        nextState.match(/inactive|background/)
      ) {
        await persist();
      }

      // Sync immediately when app comes to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active' &&
        walletAddress
      ) {
        console.log('🔄 App resumed, syncing with backend...');
        await refreshBalance();
      }

      appState.current = nextState;
    });
    return () => sub.remove();
  }, [walletAddress]);

  const value = {
    walletAddress,
    setWalletAddress,
    totalBalance,
    walletBalance,
    refreshBalance,
    miningStatus,
    currentMultiplier,
    selectedDuration,
    remainingSeconds,
    liveTokens,
    isLoading,
    hasUnclaimedRewards,
    config,
    configLoading,
    startMining,
    stopMining,
    upgradeMultiplier,
    claimRewards,
    logout,
    // Ad reward popup
    showAdRewardPopup,
    adRewardTokens,
    setAdRewardPopup,
    setLocalBalance: (val: number) => {
      setTotalBalance(val);
      setWalletBalance(val);
    },
    adRewardStatus,
  };

  return (
    <MiningContext.Provider value={value}>{children}</MiningContext.Provider>
  );
};
