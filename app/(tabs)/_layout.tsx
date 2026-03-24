import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabBarIcon({ name, color }: { name: IoniconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  const tint = Colors.dark.tint;
  const tabIconDefault = Colors.dark.tabIconDefault;
  const background = Colors.dark.background;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#222222',
        },
        headerStyle: {
          backgroundColor: background,
        },
        headerTintColor: Colors.dark.text,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '쉘터',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: '퀘스트',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="game-controller" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: '상점',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="cart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
