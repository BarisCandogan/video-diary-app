import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import VideoTrimmer from "../../components/video/VideoTrimmer";
import VideoMetadataForm from "../../components/video/VideoMetadataForm";
import { useVideoStore } from "../../hooks/useVideoStore";
import { generateUniqueId } from "../../utils/helpers";
import { getVideoDuration, ensureCompatibleFormat } from "../../utils/ffmpeg";
import VideoPlayer from "../../components/video/VideoPlayer";
import { Ionicons } from "@expo/vector-icons";

export default function NewVideoScreen() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [trimmedVideo, setTrimmedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const { addVideo } = useVideoStore();

  const pickVideo = async () => {
    try {
      setIsProcessing(true);
      setProcessingStep("İzinler kontrol ediliyor");

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("İzin Gerekli", "Video seçmek için galeri izni gerekiyor");
        return;
      }

      setProcessingStep("Video seçiliyor");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log("Seçilen video:", result.assets[0].uri);

        setProcessingStep("Video formatı kontrol ediliyor");
        const compatibleUri = await ensureCompatibleFormat(
          result.assets[0].uri
        );

        setSelectedVideo(compatibleUri);
        setTrimmedVideo(null);

        console.log("İşlenmiş video URI:", compatibleUri);
      }
    } catch (error) {
      console.error("Video seçme hatası:", error);
      Alert.alert("Hata", "Video seçilirken bir hata oluştu");
    } finally {
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  const handleTrimComplete = (trimmedUri: string) => {
    console.log("Kırpılan video:", trimmedUri);
    setTrimmedVideo(trimmedUri);
    Alert.alert(
      "Başarılı",
      "Video başarıyla kırpıldı. Şimdi bilgileri doldurup kaydedebilirsiniz."
    );
  };

  const handleVideoChange = (newUri: string) => {
    setSelectedVideo(newUri);
    setTrimmedVideo(null);
  };

  const handleSave = async (metadata: {
    title: string;
    description: string;
  }) => {
    if (!trimmedVideo) {
      Alert.alert("Hata", "Lütfen önce videoyu kırpın");
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStep("Video kaydediliyor");

      const duration = await getVideoDuration(trimmedVideo);

      addVideo({
        id: generateUniqueId(),
        title: metadata.title,
        description: metadata.description,
        uri: trimmedVideo,
        trimmedUri: trimmedVideo,
        createdAt: new Date().toISOString(),
        duration: duration,
      });

      Alert.alert("Başarılı", "Video başarıyla kaydedildi", [
        {
          text: "Tamam",
          onPress: () => {
            setSelectedVideo(null);
            setTrimmedVideo(null);
          },
        },
      ]);
    } catch (error) {
      console.error("Video kaydetme hatası:", error);
      Alert.alert("Hata", "Video kaydedilirken bir hata oluştu");
    } finally {
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Yeni Video</Text>
        </View>

        {!selectedVideo ? (
          <View style={styles.pickVideoContainer}>
            <Ionicons
              name="videocam"
              size={48}
              color="#007AFF"
              style={styles.videoIcon}
            />
            <Text style={styles.instructionText}>
              Kırpmak istediğiniz videoyu seçin
            </Text>
            <Pressable
              style={styles.pickButton}
              onPress={pickVideo}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.pickButtonText}>
                    {processingStep || "İşleniyor..."}
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="add-circle" size={20} color="#fff" />
                  <Text style={styles.pickButtonText}>Video Seç</Text>
                </View>
              )}
            </Pressable>
          </View>
        ) : (
          <>
            {!trimmedVideo ? (
              <View style={styles.trimmerSection}>
                <Text style={styles.sectionTitle}>Videoyu Kırpın</Text>
                <Text style={styles.sectionDescription}>
                  Videonun başlangıç ve bitiş noktalarını ayarlayarak kırpın
                </Text>
                <VideoTrimmer
                  sourceUri={selectedVideo}
                  onTrimComplete={handleTrimComplete}
                  onVideoChange={handleVideoChange}
                  disabled={isProcessing}
                />
              </View>
            ) : (
              <>
                <View style={styles.previewContainer}>
                  <Text style={styles.previewTitle}>
                    Kırpılmış Video Önizleme
                  </Text>
                  <VideoPlayer
                    uri={trimmedVideo}
                    style={styles.videoPreview}
                    autoPlay={false}
                  />
                </View>

                <View style={styles.formContainer}>
                  <Text style={styles.sectionTitle}>Video Bilgileri</Text>
                  <Text style={styles.sectionDescription}>
                    Videonuz için başlık ve açıklama ekleyin
                  </Text>
                  <VideoMetadataForm
                    onSubmit={handleSave}
                    isLoading={isProcessing}
                  />
                </View>
              </>
            )}
          </>
        )}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>
              {processingStep || "İşleniyor..."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#212529",
  },
  pickVideoContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    minHeight: 220,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoIcon: {
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  pickButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pickButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  processingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  trimmerSection: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 16,
  },
  previewContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#212529",
  },
  videoPreview: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#000",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
