import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useVideoStore } from "../../../hooks/useVideoStore";
import VideoPlayer from "../../../components/video/VideoPlayer";
import { Ionicons } from "@expo/vector-icons";
import { formatDate, formatDuration } from "../../../utils/format";
import * as FileSystem from "expo-file-system";
import { Video } from "../../../types/video";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Colors } from "../../../utils/Colors";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const { videos, deleteVideo } = useVideoStore();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Video ID bulunamadı");
      setIsLoading(false);
      return;
    }

    const foundVideo = videos.find((v) => v.id === id);
    if (foundVideo) {
      setVideo({
        ...foundVideo,
        createdAt:
          typeof foundVideo.createdAt === "string"
            ? parseInt(foundVideo.createdAt, 10)
            : foundVideo.createdAt,
      });
      checkVideoFile(foundVideo.uri);
    } else {
      setError("Video bulunamadı");
    }
    setIsLoading(false);
  }, [id, videos]);

  const checkVideoFile = async (uri: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        setError("Video dosyası bulunamadı");
      }
    } catch (error) {
      console.error("Dosya kontrolü hatası:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Videoyu Sil",
      "Bu videoyu silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              if (video) {
                try {
                  await FileSystem.deleteAsync(video.uri);
                  console.log("Video dosyası silindi:", video.uri);
                } catch (error) {
                  console.error("Dosya silme hatası:", error);
                }

                deleteVideo(video.id);

                router.replace("/(tabs)/");
              }
            } catch (error) {
              console.error("Video silme hatası:", error);
              Alert.alert("Hata", "Video silinirken bir hata oluştu");
            }
          },
        },
      ]
    );
  };

  if (error || !video) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Hata</Text>
          <Text style={styles.errorText}>
            {error || "Bilinmeyen bir hata oluştu"}
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Video Detayı
          </Text>
          <Pressable style={styles.deleteIcon} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
          </Pressable>
        </View>

        <View style={styles.videoContainer}>
          <VideoPlayer
            uri={video.uri}
            autoPlay={true}
            resizeMode={ResizeMode.CONTAIN}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{video.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6c757d" />
              <Text style={styles.metaText}>
                {formatDate(String(video.createdAt))}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#6c757d" />
              <Text style={styles.metaText}>
                {formatDuration(video.duration)}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Açıklama</Text>
            <Text style={styles.description}>{video.description}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    flex: 1,
    textAlign: "center",
  },
  backIcon: {
    padding: 4,
  },
  deleteIcon: {
    padding: 4,
  },
  videoContainer: {
    backgroundColor: "#000",
    width: "100%",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  metaText: {
    fontSize: 14,
    color: "#6c757d",
    marginLeft: 6,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#495057",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
