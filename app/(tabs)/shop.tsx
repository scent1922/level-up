import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Colors from '@/constants/Colors';

export default function ShopScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>상점</Text>
      <Text style={styles.subtitle}>아이템 상점 — Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.tint,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.tabIconDefault,
  },
});
