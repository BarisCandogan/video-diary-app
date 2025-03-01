import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarStyle: {
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Videolarım',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='videocam' size={size} color={color} />
          ),
          headerTitle: 'Video Günlüğüm',
        }}
      />

      <Tabs.Screen
        name='new-video'
        options={{
          title: 'Yeni Video',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='add-circle' size={size} color={color} />
          ),
          headerTitle: 'Yeni Video Ekle',
        }}
      />

      <Tabs.Screen
        name='settings'
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='settings' size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
