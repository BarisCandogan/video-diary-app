import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useVideoStore } from "../../hooks/useVideoStore";
import VideoListItem from "../../components/video/VideoListItem";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "../../types";
import Header from "../../components/Header";
import { Colors } from "../../utils/Colors";

export default function HomeScreen() {
  const { videos, loadVideos, deleteAllVideos } = useVideoStore();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await loadVideos();
    } catch (error) {
      console.error("Video yükleme hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadVideos();
    } catch (error) {
      console.error("Video yenileme hatası:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleVideoPress = (video: Video) => {
    console.log(`Video ID: ${video.id} için detay sayfasına yönlendiriliyor`);
    router.push({
      pathname: "/video/[id]",
      params: { id: video.id },
    });
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Tüm Videoları Sil",
      "Tüm videoları silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Tümünü Sil",
          style: "destructive",
          onPress: deleteAllVideos,
        },
      ]
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="videocam-outline" size={64} color="#adb5bd" />
      <Text style={styles.emptyText}>Henüz video yok</Text>
      <Text style={styles.emptySubtext}>
        Yeni bir video eklemek için sağ alt köşedeki butona tıklayın
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)/new-video")}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>Yeni Video Ekle</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Videolarım"
        showDeleteButton={videos.length > 0}
        onDeleteAll={handleDeleteAll}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      <Link href="/(tabs)/new-video" asChild>
        <Pressable style={styles.fab}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
  },
  deleteAllButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  deleteAllText: {
    color: Colors.error,
    marginLeft: 4,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
