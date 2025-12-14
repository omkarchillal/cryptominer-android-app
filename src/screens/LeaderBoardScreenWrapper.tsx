import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../contexts/MiningContext';
import { api } from '../services/api';
import { CustomRefreshControl } from '../components/CustomRefreshControl';

type User = {
  id: string;
  name: string;
  points: number;
  rank: number;
};

export default function LeaderBoardScreenWrapper({ navigation }: any) {
  const { walletAddress } = useMining();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      console.log('🏆 Fetching leaderboard from backend...');
      const response = await api.get('/api/leaderboard');
      console.log('✅ Leaderboard data received:', response.data);

      // Transform and rank users
      const leaderboardData = response.data.map((user: any, index: number) => {
        const walletAddress = user.walletAddress;
        const displayName =
          walletAddress && walletAddress.length > 10
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : walletAddress;

        return {
          id: walletAddress,
          name: displayName,
          points: user.totalCoins || 0,
          rank: index + 1,
        };
      });

      setUsers(leaderboardData);
      console.log(`✅ Loaded ${leaderboardData.length} users to leaderboard`);
      console.log(
        `📊 Top 3: ${leaderboardData.slice(0, 3).length}, Rest: ${
          leaderboardData.slice(3).length
        }`,
      );
    } catch (error) {
      console.error('❌ Failed to fetch leaderboard:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const top3 = users.slice(0, 3);
  const restUsers = users.slice(3);

  const renderTopMiners = () => {
    if (top3.length === 0) return null;

    const first = top3.find(u => u.rank === 1);
    const second = top3.find(u => u.rank === 2);
    const third = top3.find(u => u.rank === 3);

    return (
      <View style={styles.topMinersContainer}>
        <Text style={styles.topMinersTitle}>Top Miners</Text>

        <View style={styles.podiumContainer}>
          {/* Second Place */}
          {second && (
            <View style={styles.podiumItem}>
              <View style={[styles.rankBadge, styles.rankBadge2]}>
                <Text style={styles.rankBadgeText}>2</Text>
              </View>
              <Text style={styles.podiumName}>{second.name}</Text>
              <Text style={styles.podiumPoints}>
                {second.points.toFixed(0)}
              </Text>
              <Text style={styles.podiumLabel}>tokens</Text>
              <LinearGradient
                colors={[
                  'rgba(156, 163, 175, 0.8)',
                  'rgba(107, 114, 128, 0.8)',
                ]}
                style={[styles.podiumBar, styles.podiumBar2]}
              >
                <Text style={styles.podiumIcon}>🥈</Text>
              </LinearGradient>
            </View>
          )}

          {/* First Place */}
          {first && (
            <View style={styles.podiumItem}>
              <View style={[styles.rankBadge, styles.rankBadge1]}>
                <Text style={styles.crownIcon}>👑</Text>
              </View>
              <Text style={styles.podiumName}>{first.name}</Text>
              <Text style={[styles.podiumPoints, styles.podiumPoints1]}>
                {first.points.toFixed(0)}
              </Text>
              <Text style={[styles.podiumLabel, styles.podiumLabel1]}>
                tokens
              </Text>
              <LinearGradient
                colors={['rgba(251, 191, 36, 1)', 'rgba(245, 158, 11, 1)']}
                style={[styles.podiumBar, styles.podiumBar1]}
              >
                <Text style={styles.podiumIcon}>🏆</Text>
              </LinearGradient>
            </View>
          )}

          {/* Third Place */}
          {third && (
            <View style={styles.podiumItem}>
              <View style={[styles.rankBadge, styles.rankBadge3]}>
                <Text style={styles.rankBadgeText}>3</Text>
              </View>
              <Text style={styles.podiumName}>{third.name}</Text>
              <Text style={styles.podiumPoints}>{third.points.toFixed(0)}</Text>
              <Text style={styles.podiumLabel}>tokens</Text>
              <LinearGradient
                colors={['rgba(249, 115, 22, 1)', 'rgba(234, 88, 12, 1)']}
                style={[styles.podiumBar, styles.podiumBar3]}
              >
                <Text style={styles.podiumIcon}>🥉</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: User }) => {
    const isCurrentUser = item.id === walletAddress;

    return (
      <View style={[styles.userItem, isCurrentUser && styles.currentUserItem]}>
        <Text style={styles.rankNumber}>{item.rank}</Text>
        <View style={styles.userInfo}>
          <Text
            style={[styles.userName, isCurrentUser && styles.currentUserText]}
          >
            {item.name}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text
            style={[
              styles.userPoints,
              isCurrentUser && styles.currentUserPointsText,
            ]}
          >
            {item.points.toFixed(2)} tokens
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#581c87', '#2e2e81']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Animated background elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No users yet</Text>
            <Text style={styles.emptySubtext}>
              Start mining to appear on the leaderboard!
            </Text>
          </View>
        ) : (
          <FlatList
            data={restUsers}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="transparent"
                colors={['transparent']}
                progressBackgroundColor="transparent"
              />
            }
            ListHeaderComponent={
              <>
                <CustomRefreshControl refreshing={refreshing} />
                {/* Top 3 Podium */}
                {renderTopMiners()}

                {/* All Rankings Header */}
                {restUsers.length > 0 && (
                  <View style={styles.allRankingsHeader}>
                    <Text style={styles.allRankingsTitle}>All Rankings</Text>
                  </View>
                )}
              </>
            }
            ListEmptyComponent={
              restUsers.length === 0 && users.length <= 3 ? (
                <View style={styles.noMoreUsers}>
                  <Text style={styles.noMoreUsersText}>
                    Only {users.length} {users.length === 1 ? 'user' : 'users'}{' '}
                    on the leaderboard
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  bgCircle1: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 192,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '25%',
    right: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 192,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    margin: 16,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topMinersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 20,
    margin: 16,
    marginBottom: 16,
  },
  topMinersTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 280,
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 110,
  },
  rankBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rankBadge1: {
    backgroundColor: 'rgba(251, 191, 36, 1)',
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#fbbf24',
    shadowOpacity: 0.6,
  },
  rankBadge2: {
    backgroundColor: 'rgba(156, 163, 175, 1)',
  },
  rankBadge3: {
    backgroundColor: 'rgba(249, 115, 22, 1)',
  },
  crownIcon: {
    fontSize: 32,
  },
  rankBadgeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 2,
  },
  podiumPoints1: {
    fontSize: 20,
    color: '#fbbf24',
  },
  podiumLabel: {
    fontSize: 12,
    color: '#e9d5ff',
    marginBottom: 8,
  },
  podiumLabel1: {
    fontSize: 13,
    fontWeight: '600',
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  podiumBar1: {
    height: 140,
  },
  podiumBar2: {
    height: 100,
  },
  podiumBar3: {
    height: 80,
  },
  podiumIcon: {
    fontSize: 40,
  },
  allRankingsHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    marginHorizontal: 16,
  },
  allRankingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 2,
  },
  currentUserItem: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.4)',
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    width: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  currentUserText: {
    color: '#fbbf24',
  },
  userPoints: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  currentUserPointsText: {
    color: 'rgba(251, 191, 36, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#e9d5ff',
    fontSize: 14,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
  },
  noMoreUsers: {
    padding: 20,
    alignItems: 'center',
  },
  noMoreUsersText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
