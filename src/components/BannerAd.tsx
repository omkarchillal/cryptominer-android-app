import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// Your AdMob Banner Ad Unit ID
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER // Test ad for development
  : 'ca-app-pub-7930332952469106/9843673377'; // Your production Banner Ad Unit ID

interface BannerAdComponentProps {
  size?: BannerAdSize;
}

export const BannerAdComponent: React.FC<BannerAdComponentProps> = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
}) => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('✅ Banner ad loaded');
        }}
        onAdFailedToLoad={error => {
          console.error('❌ Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
});
