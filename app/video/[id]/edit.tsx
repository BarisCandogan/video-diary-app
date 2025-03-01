import React from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useVideoStore } from '../../../hooks/useVideoStore'
import VideoMetadataForm from '../../../components/video/VideoMetadataForm'
import VideoPlayer from '../../../components/video/VideoPlayer'

export default function EditVideoScreen() {
  const { id } = useLocalSearchParams()
  const { videos, updateVideo } = useVideoStore()

  const video = videos.find((v) => v.id === id)

  if (!video) {
    return null
  }

  const handleUpdate = (metadata: { title: string; description: string }) => {
    try {
      updateVideo(video.id, metadata)
      Alert.alert('Başarılı', 'Video bilgileri güncellendi', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      Alert.alert('Hata', 'Video güncellenirken bir hata oluştu')
    }
  }

  return (
    <View style={styles.container}>
      <VideoPlayer uri={video.trimmedUri} style={styles.videoPreview} />

      <VideoMetadataForm
        initialData={{
          title: video.title,
          description: video.description,
        }}
        onSubmit={handleUpdate}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoPreview: {
    height: 200,
  },
})
