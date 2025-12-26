import {
    RewardedAd,
    RewardedAdEventType,
    AdEventType,
    TestIds,
    MobileAds,
} from 'react-native-google-mobile-ads';

// AdMob Rewarded Ad Unit ID
// Using TestIds.REWARDED for development and testing
const REWARDED_AD_UNIT_ID = __DEV__
    ? TestIds.REWARDED
    : TestIds.REWARDED; // Replace with production ID when ready

class AdManager {
    private rewardedAd: RewardedAd | null = null;
    private isLoaded: boolean = false;
    private listeners: (() => void)[] = [];
    private initializationPromise: Promise<void> | null = null;

    constructor() {
        this.handleAdLoaded = this.handleAdLoaded.bind(this);
    }

    /**
     * Initialize the Mobile Ads SDK and start preloading an ad.
     * key called from App.tsx
     */
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = MobileAds().initialize().then(() => {
            console.log('📱 Mobile Ads initialized by AdManager');
            this.loadNextAd();
        });

        return this.initializationPromise;
    }

    /**
     * Create and load a new rewarded ad instance.
     */
    private loadNextAd() {
        if (this.isLoaded) return;

        console.log('🔄 AdManager: Preloading next ad...');
        this.rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

        this.rewardedAd.addAdEventListener(
            RewardedAdEventType.LOADED,
            this.handleAdLoaded
        );

        // We handle errors to auto-retry
        this.rewardedAd.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            (reward) => console.log('AdManager: Reward earned', reward)
        );

        this.rewardedAd.addAdEventListener(
            AdEventType.ERROR,
            this.handleAdError
        );

        this.rewardedAd.load();
    }

    private handleAdLoaded() {
        console.log('✅ AdManager: Ad loaded and ready');
        this.isLoaded = true;
        this.notifyListeners();
    }

    private handleAdError = (error: any) => {
        console.error('❌ AdManager: Failed to load ad:', error);
        this.isLoaded = false;
        this.rewardedAd = null;

        // Retry after delay (exponential backoff could be better, but fixed for now)
        console.log('⏳ AdManager: Retrying in 5 seconds...');
        setTimeout(() => this.loadNextAd(), 5000);
    }

    /**
     * Subscribe to ad availability updates.
     * Useful if the screen opens and ad isn't ready yet.
     */
    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    /**
     * Returns true if an ad is currently loaded and ready to show.
     */
    isReady(): boolean {
        return this.isLoaded && this.rewardedAd !== null;
    }

    /**
     * Returns the current loaded ad instance.
     * The caller is responsible for attaching EARNED_REWARD listeners and showing it.
     */
    getAd(): RewardedAd | null {
        if (this.isReady()) {
            const ad = this.rewardedAd;
            this.rewardedAd = null;
            this.isLoaded = false;
            // Preload next ad after a small delay
            setTimeout(() => this.loadNextAd(), 1000);
            return ad;
        }
        return null;
    }
}

export const adManager = new AdManager();
