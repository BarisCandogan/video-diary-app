import { create } from "zustand";
import { Video, VideoMetadata } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

interface VideoStore {
  videos: Video[];
  addVideo: (video: Video) => void;
  updateVideo: (id: string, metadata: VideoMetadata) => void;
  deleteVideo: (id: string) => void;
  deleteAllVideos: () => Promise<void>;
  loadVideos: () => Promise<void>;
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],

  addVideo: (video) =>
    set((state) => {
      const newVideos = [...state.videos, video];
      AsyncStorage.setItem("videos", JSON.stringify(newVideos));
      return { videos: newVideos };
    }),

  updateVideo: (id, metadata) =>
    set((state) => {
      const newVideos = state.videos.map((video) =>
        video.id === id ? { ...video, ...metadata } : video
      );
      AsyncStorage.setItem("videos", JSON.stringify(newVideos));
      return { videos: newVideos };
    }),

  deleteVideo: async (id) =>
    set((state) => {
      const videoToDelete = state.videos.find((video) => video.id === id);
      if (videoToDelete) {
        try {
          FileSystem.deleteAsync(videoToDelete.uri);
        } catch (error) {
          console.error("Video dosyası silinirken hata:", error);
        }
      }
      const newVideos = state.videos.filter((video) => video.id !== id);
      AsyncStorage.setItem("videos", JSON.stringify(newVideos));
      return { videos: newVideos };
    }),

  deleteAllVideos: async () => {
    set((state) => {
      state.videos.forEach(async (video) => {
        try {
          await FileSystem.deleteAsync(video.uri);
        } catch (error) {
          console.error("Video dosyası silinirken hata:", error);
        }
      });
      AsyncStorage.setItem("videos", JSON.stringify([]));
      return { videos: [] };
    });
  },

  loadVideos: async () => {
    const videosJson = await AsyncStorage.getItem("videos");
    if (videosJson) {
      set({ videos: JSON.parse(videosJson) });
    }
  },
}));
