// LeaderboardScreen.tsx
import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type User = {
  id: string;
  name: string;
  points: number;
  avatar?: string;
};

type RankedUser = User & { rank: number };

type Props = {
  users: User[];
  currentUserId: string;
  initialSnap?: number; // collapsed height in px that's still visible
};

const { height: SCREEN_H } = Dimensions.get('window');

const Avatar = ({ uri, size = 56 }: { uri?: string; size?: number }) => (
  <View
    style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  >
    {uri ? (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    ) : (
      <Text style={styles.avatarInitial}>🙂</Text>
    )}
  </View>
);

const ITEM_HEIGHT = 64;

const LeaderboardScreen: React.FC<Props> = ({
  users,
  currentUserId,
  initialSnap = 120,
}) => {
  // rank users
  const ranked: RankedUser[] = useMemo(() => {
    const sorted = [...users].sort((a, b) => b.points - a.points);
    return sorted.map((u, i) => ({ ...u, rank: i + 1 }));
  }, [users]);

  const top3 = ranked.slice(0, 0);
  const listData = ranked;

  const currentIndex = useMemo(
    () => listData.findIndex(u => u.id === currentUserId),
    [listData, currentUserId],
  );
  const currentUser = currentIndex >= 0 ? listData[currentIndex] : undefined;

  // ----- Bottom Sheet -----
  const MAX_HEIGHT = Math.min(SCREEN_H * 0.88, 720);
  const MIN_HEIGHT = initialSnap;
  const translateY = useSharedValue(MAX_HEIGHT - MIN_HEIGHT);

  const [showSticky, setShowSticky] = useState<boolean>(true);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const visible = viewableItems.some(
        vi => vi.index !== null && vi.index === currentIndex,
      );
      setShowSticky(!visible);
    },
  ).current;

  const viewConfigRef = useRef({ itemVisiblePercentThreshold: 50 });

  // shared to store where the sheet was when the drag started
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate(e => {
      // e.translationY = total movement since gesture began
      const next = Math.min(
        Math.max(startY.value + e.translationY, 0),
        MAX_HEIGHT - MIN_HEIGHT,
      );
      translateY.value = next;
    })
    .onEnd(() => {
      const threshold = (MAX_HEIGHT - MIN_HEIGHT) / 2;
      const snapTo = translateY.value > threshold ? MAX_HEIGHT - MIN_HEIGHT : 0;
      translateY.value = withSpring(snapTo, { damping: 18, stiffness: 220 });
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ---- renderers ----
  const renderRow = useCallback(
    ({ item }: ListRenderItemInfo<RankedUser>) => {
      const isCurrent = item.id === currentUserId;
      return (
        <View style={[styles.row, isCurrent && styles.rowCurrent]}>
          <View style={styles.rankBubble}>
            <Text style={styles.rankText}>{item.rank}</Text>
          </View>
          <Avatar uri={item.avatar} size={44} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.rowName, isCurrent && styles.currentName]}>
              {item.name}
            </Text>
            <Text style={styles.rowSub}>
              {item.points.toLocaleString()} coins
            </Text>
          </View>
          {isCurrent && <Text style={styles.youTag}>You</Text>}
        </View>
      );
    },
    [currentUserId],
  );

  const keyExtractor = useCallback((u: RankedUser) => u.id, []);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        {/* 3D Trophy Animation */}
        <View style={styles.trophyContainer}>
          <Text style={styles.trophyEmoji}>🏆</Text>
        </View>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.segment}>
          <TouchableOpacity style={[styles.segmentBtn, styles.segmentActive]}>
            <Text style={styles.segmentTextActive}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.segmentBtn}>
            <Text style={styles.segmentText}>All Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Podium */}
      <View style={styles.podiumWrap}>
        {/* #2 */}
        <View style={[styles.podiumCol, { alignItems: 'center' }]}>
          <Avatar uri={top3[1]?.avatar} size={62} />
          <Text style={styles.nameSmall} numberOfLines={1}>
            {top3[1]?.name || '-'}
          </Text>
          <Text style={styles.pointsSmall}>
            {(top3[1]?.points ?? 0).toLocaleString()}P
          </Text>
          <View style={[styles.block, styles.block2]}>
            <Text style={styles.blockNo}>2</Text>
          </View>
        </View>

        {/* #1 */}
        <View
          style={[styles.podiumCol, { alignItems: 'center', marginTop: -10 }]}
        >
          <Avatar uri={top3[0]?.avatar} size={76} />
          <Text style={styles.nameBig} numberOfLines={1}>
            {top3[0]?.name || '-'}
          </Text>
          <Text style={styles.pointsBig}>
            {(top3[0]?.points ?? 0).toLocaleString()}P
          </Text>
          <View style={[styles.block, styles.block1]}>
            <Text style={styles.blockNo}>1</Text>
          </View>
        </View>

        {/* #3 */}
        <View style={[styles.podiumCol, { alignItems: 'center' }]}>
          <Avatar uri={top3[2]?.avatar} size={62} />
          <Text style={styles.nameSmall} numberOfLines={1}>
            {top3[2]?.name || '-'}
          </Text>
          <Text style={styles.pointsSmall}>
            {(top3[2]?.points ?? 0).toLocaleString()}P
          </Text>
          <View style={[styles.block, styles.block3]}>
            <Text style={styles.blockNo}>3</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { height: MAX_HEIGHT }, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <Animated.View>
            <View style={styles.pullBar} />
          </Animated.View>
        </GestureDetector>

        <Text style={styles.sheetTitle}>Ranks</Text>

        <FlatList
          data={listData}
          renderItem={renderRow}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: 96 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
        />

        {/* Sticky current user card */}
        {currentUser && showSticky && (
          <View style={styles.stickyWrap}>
            <View style={[styles.row, styles.rowCurrent]}>
              <View style={styles.rankBubble}>
                <Text style={styles.rankText}>{currentUser.rank}</Text>
              </View>
              <Avatar uri={currentUser.avatar} size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.rowName, styles.currentName]}>
                  {currentUser.name}
                </Text>
                <Text style={styles.rowSub}>
                  {currentUser.points.toLocaleString()} points
                </Text>
              </View>
              <Text style={styles.youTag}>You</Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default LeaderboardScreen;

// ------- Styles -------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#241E71',
  },
  header: {
    paddingTop: Platform.select({ ios: 54, android: 24, default: 24 }),
    paddingHorizontal: 20,
  },
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyEmoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  segment: {
    backgroundColor: '#3B2FA0',
    borderRadius: 22,
    padding: 4,
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  segmentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  segmentActive: {
    backgroundColor: '#fff',
  },
  segmentText: {
    color: '#C9C5FF',
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#241E71',
    fontWeight: '800',
  },

  podiumWrap: {
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  podiumCol: { width: '30%' },
  nameBig: {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  pointsBig: { color: '#FFE27A', fontWeight: '800', marginBottom: 8 },
  nameSmall: {
    marginTop: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  pointsSmall: { color: '#B6A8FF', fontWeight: '700', marginBottom: 8 },

  block: {
    width: '100%',
    height: 84,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block1: { backgroundColor: '#FFD12F', height: 110 },
  block2: { backgroundColor: '#F6C640', height: 90 },
  block3: { backgroundColor: '#F6C640', height: 78 },
  blockNo: { fontSize: 36, fontWeight: '900', color: '#241E71' },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  pullBar: {
    alignSelf: 'center',
    width: 52,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowCurrent: {
    backgroundColor: '#F1F5FF',
  },
  rankBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontWeight: '800',
    color: '#475569',
  },
  rowName: {
    color: '#111827',
    fontWeight: '700',
  },
  currentName: {
    color: '#111827',
  },
  rowSub: {
    color: '#6B7280',
    fontSize: 12,
  },
  youTag: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },

  avatar: {
    backgroundColor: '#E9E5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 22 },

  stickyWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
});
