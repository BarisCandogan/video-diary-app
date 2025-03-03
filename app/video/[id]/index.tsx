import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useVideoStore } from "../../../hooks/useVideoStore";
import VideoPlayer from "../../../components/video/VideoPlayer";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { Colors } from "../../../utils/Colors";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const { videos, deleteVideo } = useVideoStore();
  const [isLoading, setIsLoading] = useState(true);
  const [videoExists, setVideoExists] = useState(true);

  const video = videos.find((v) => v.id === id);

  useEffect(() => {
    checkVideoFile();
  }, []);

  const checkVideoFile = async () => {
    if (!video) {
      setIsLoading(false);
      return;
    }

    try {
      // Dosyanın varlığını kontrol et
      const fileInfo = await FileSystem.getInfoAsync(video.trimmedUri);
      console.log("Video dosya bilgisi:", fileInfo);

      if (!fileInfo.exists) {
        console.warn("Video dosyası bulunamadı:", video.trimmedUri);
        setVideoExists(false);
      }
    } catch (error) {
      console.error("Dosya kontrolü hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!video) return;
    router.push(`/video/${id}/edit`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Video Bulunamadı</Text>
        <Text style={styles.errorText}>
          Bu video silinmiş veya mevcut değil.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {!videoExists ? (
        <View style={styles.videoErrorContainer}>
          <Ionicons name="videocam-off" size={48} color={Colors.error} />
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
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  videoErrorContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  videoErrorText: {
    textAlign: "center",
    marginTop: 16,
    color: "#666",
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    color: "#666",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-around",
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
