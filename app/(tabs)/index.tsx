import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useVideoStore } from '../../hooks/useVideoStore'
import VideoListItem from '../../components/video/VideoListItem'
import { Ionicons } from '@expo/vector-icons'
import { Video } from '../../types'

export default function HomeScreen() {
  const { videos, loadVideos } = useVideoStore()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      await loadVideos()
    } catch (error) {
      console.error('Video yükleme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadVideos()
    } catch (error) {
      console.error('Video yenileme hatası:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleVideoPress = (video: Video) => {
    console.log(`Video ID: ${video.id} için detay sayfasına yönlendiriliyor`)
    router.push({
      pathname: '/video/[id]',
      params: { id: video.id },
    })
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name='videocam-outline' size={64} color='#adb5bd' />
      <Text style={styles.emptyText}>Henüz video yok</Text>
      <Text style={styles.emptySubtext}>
        Yeni bir video eklemek için sağ alt köşedeki butona tıklayın
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)/new-video')}
      >
        <Ionicons name='add-circle' size={20} color='#fff' />
        <Text style={styles.emptyButtonText}>Yeni Video Ekle</Text>
      </Pressable>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Videolarım</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>Videolar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoListItem
              video={item}
              onPress={() => handleVideoPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor='#007AFF'
            />
          }
        />
      )}

      <Link href='/(tabs)/new-video' asChild>
        <Pressable style={styles.fab}>
          <Ionicons name='add' size={24} color='#fff' />
        </Pressable>
      </Link>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212529',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
})
