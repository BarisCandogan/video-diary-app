import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useVideoStore } from '../../../hooks/useVideoStore'
import VideoPlayer from '../../../components/video/VideoPlayer'
import { Share } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams()
  const { videos, deleteVideo } = useVideoStore()
  const [isLoading, setIsLoading] = useState(true)
  const [videoExists, setVideoExists] = useState(true)

  const video = videos.find((v) => v.id === id)

  useEffect(() => {
    checkVideoFile()
  }, [])

  const checkVideoFile = async () => {
    if (!video) {
      setIsLoading(false)
      return
    }

    try {
      // Dosyanın varlığını kontrol et
      const fileInfo = await FileSystem.getInfoAsync(video.trimmedUri)
      console.log('Video dosya bilgisi:', fileInfo)

      if (!fileInfo.exists) {
        console.warn('Video dosyası bulunamadı:', video.trimmedUri)
        setVideoExists(false)
      }
    } catch (error) {
      console.error('Dosya kontrolü hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!video) return

    try {
      await Share.share({
        url: video.trimmedUri,
        message: `${video.title}\n${video.description}`,
      })
    } catch (error) {
      console.error('Paylaşım hatası:', error)
      Alert.alert('Hata', 'Video paylaşılırken bir hata oluştu')
    }
  }

  const handleDelete = () => {
    if (!video) return

    Alert.alert(
      'Videoyu Sil',
      'Bu videoyu silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteVideo(video.id)
            router.back()
          },
        },
      ]
    )
  }

  const handleEdit = () => {
    if (!video) return
    router.push(`/video/${id}/edit`)
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    )
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name='alert-circle' size={64} color='#FF3B30' />
        <Text style={styles.errorTitle}>Video Bulunamadı</Text>
        <Text style={styles.errorText}>
          Bu video silinmiş veya mevcut değil.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {!videoExists ? (
        <View style={styles.videoErrorContainer}>
          <Ionicons name='videocam-off' size={48} color='#FF3B30' />
          <Text style={styles.videoErrorText}>
            Video dosyası bulunamadı. Dosya silinmiş veya taşınmış olabilir.
          </Text>
        </View>
      ) : (
        <VideoPlayer uri={video.trimmedUri} />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.date}>
          {new Date(video.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.description}>{video.description}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={handleEdit}>
          <Ionicons name='create' size={20} color='#fff' />
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleShare}>
          <Ionicons name='share' size={20} color='#fff' />
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name='trash' size={20} color='#fff' />
          <Text style={styles.actionButtonText}>Sil</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  videoErrorContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoErrorText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
})
