import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "../../types";
import { formatDuration, formatDate } from "@/utils/format";
import { generateThumbnail } from "../../utils/video";
import { useVideoStore } from "../../hooks/useVideoStore";

interface VideoListItemProps {
  video: Video;
  onPress: () => void;
}

export default function VideoListItem({ video, onPress }: VideoListItemProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteVideo } = useVideoStore();

  useEffect(() => {
    loadThumbnail();
  }, [video.uri]);

  const loadThumbnail = async () => {
    try {
      const thumbUri = await generateThumbnail(video.uri);
      setThumbnail(thumbUri);
    } catch (error) {
      console.error("Thumbnail yükleme hatası:", error);
    } finally {
      setIsLoading(false);
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
          onPress: () => deleteVideo(video.id),
        },
      ]
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.thumbnailContainer}>
        {isLoading ? (
          <View style={styles.thumbnailLoading}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        ) : (
          <Image
            source={{
              uri:
                thumbnail || "https://via.placeholder.com/120x120?text=Video",
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(video.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {video.description}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6c757d" />
            <Text style={styles.metaText}>{formatDate(video.createdAt)}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#6c757d" />
            <Text style={styles.metaText}>
              {formatDuration(video.duration)}
            </Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.deleteButton} onPress={handleDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color="#dc3545" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: "#f8f9fa",
  },
  thumbnailContainer: {
    width: 120,
    height: 120,
    position: "relative",
    backgroundColor: "#e9ecef",
  },
  thumbnailLoading: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#6c757d",
    marginLeft: 4,
  },
  arrow: {
    alignSelf: "center",
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
    marginRight: 4,
  },
});
