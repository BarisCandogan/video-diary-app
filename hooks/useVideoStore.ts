import { create } from 'zustand'
import { Video, VideoMetadata } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface VideoStore {
  videos: Video[]
  addVideo: (video: Video) => void
  updateVideo: (id: string, metadata: VideoMetadata) => void
  deleteVideo: (id: string) => void
  loadVideos: () => Promise<void>
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],

  addVideo: (video) =>
    set((state) => {
      const newVideos = [...state.videos, video]
      AsyncStorage.setItem('videos', JSON.stringify(newVideos))
      return { videos: newVideos }
    }),

  updateVideo: (id, metadata) =>
    set((state) => {
      const newVideos = state.videos.map((video) =>
        video.id === id ? { ...video, ...metadata } : video
      )
      AsyncStorage.setItem('videos', JSON.stringify(newVideos))
      return { videos: newVideos }
    }),

  deleteVideo: (id) =>
    set((state) => {
      const newVideos = state.videos.filter((video) => video.id !== id)
      AsyncStorage.setItem('videos', JSON.stringify(newVideos))
      return { videos: newVideos }
    }),

  loadVideos: async () => {
    const videosJson = await AsyncStorage.getItem('videos')
    if (videosJson) {
      set({ videos: JSON.parse(videosJson) })
    }
  },
}))
