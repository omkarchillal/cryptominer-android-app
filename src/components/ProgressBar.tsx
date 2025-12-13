import React from 'react';
import { View } from 'react-native';

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <View style={{ height: 17, backgroundColor: '#eee', borderRadius: 8 }}>
      <View
        style={{
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          height: '100%',
          backgroundColor: '#0dd356ff',
          borderRadius: 8,
        }}
      />
    </View>
  );
};
