import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Video, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useFFmpeg } from "../../hooks/useFFmpeg";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { ensureCompatibleFormat } from "../../utils/ffmpeg";

interface VideoTrimmerProps {
  sourceUri: string;
  onTrimComplete: (trimmedUri: string) => void;
  onVideoChange?: (newUri: string) => void;
  disabled?: boolean;
}

export default function VideoTrimmer({
  sourceUri,
  onTrimComplete,
  onVideoChange,
  disabled = false,
}: VideoTrimmerProps) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [trimError, setTrimError] = useState<string | null>(null);
  const [isChangingVideo, setIsChangingVideo] = useState(false);

  const { trimVideo } = useFFmpeg();

  // Video yüklendiğinde süresini al
  const handleVideoLoad = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      const videoDuration = status.durationMillis
        ? status.durationMillis / 1000
        : 0;
      setDuration(videoDuration);
      setEndTime(Math.min(videoDuration, startTime + 30)); // Maksimum 30 saniyelik bir aralık
      setIsVideoReady(true);
      console.log("Video süresi:", videoDuration);
    }
  };

  // Video oynatma pozisyonunu takip et
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
    }
  };

  const handleTrim = async () => {
    if (startTime >= endTime) {
      Alert.alert("Hata", "Başlangıç zamanı bitiş zamanından küçük olmalıdır");
      return;
    }

    if (endTime - startTime > 60) {
      Alert.alert(
        "Uyarı",
        "Kırpma süresi çok uzun (60 saniyeden fazla). Bu işlem uzun sürebilir.",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Devam Et",
            onPress: () => performTrim(),
          },
        ]
      );
    } else {
      performTrim();
    }
  };

  const performTrim = async () => {
    try {
      setIsLoading(true);
      setTrimError(null);
      console.log("Video kırpma başlıyor...");
      console.log("Başlangıç:", startTime, "Bitiş:", endTime);
      console.log("Kaynak URI:", sourceUri);

      // URI'yi platform bazında düzelt
      let fixedSourceUri = sourceUri;
      if (Platform.OS === "android" && sourceUri.startsWith("file:///")) {
        fixedSourceUri = sourceUri.substring(7);
      }

      const trimmedUri = await trimVideo.mutateAsync({
        sourceUri: fixedSourceUri,
        startTime,
        endTime,
      });

      console.log("Kırpılan video URI:", trimmedUri);

      // Kırpılan video dosyasının varlığını kontrol et
      const fileInfo = await FileSystem.getInfoAsync(trimmedUri);
      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error("Kırpılan video dosyası oluşturulamadı veya boş");
      }

      onTrimComplete(trimmedUri);
    } catch (error) {
      console.error("Video kırpma hatası:", error);
      setTrimError(error.message);
      Alert.alert("Hata", `Video kırpma hatası: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeVideo = async () => {
    try {
      setIsChangingVideo(true);

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("İzin Gerekli", "Video seçmek için galeri izni gerekiyor");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log("Yeni seçilen video:", result.assets[0].uri);

        // Video formatını kontrol et ve gerekirse dönüştür
        const compatibleUri = await ensureCompatibleFormat(
          result.assets[0].uri
        );

        if (onVideoChange) {
          onVideoChange(compatibleUri);
        }

        // Durumları sıfırla
        setStartTime(0);
        setEndTime(0);
        setCurrentTime(0);
        setIsVideoReady(false);
        setTrimError(null);
      }
    } catch (error) {
      console.error("Video değiştirme hatası:", error);
      Alert.alert("Hata", "Video değiştirilirken bir hata oluştu");
    } finally {
      setIsChangingVideo(false);
    }
  };

  // Belirli bir konuma atla
  const seekToPosition = (time: number) => {
    if (videoRef.current) {
      videoRef.current.setPositionAsync(time * 1000);
    }
  };

  // Başlangıç noktasını ayarla
  const setStartPosition = () => {
    setStartTime(currentTime);
    if (currentTime >= endTime) {
      setEndTime(Math.min(currentTime + 30, duration));
    }
  };

  // Bitiş noktasını ayarla
  const setEndPosition = () => {
    setEndTime(currentTime);
    if (currentTime <= startTime) {
      setStartTime(Math.max(currentTime - 30, 0));
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: sourceUri }}
          style={styles.preview}
          useNativeControls
          resizeMode="contain"
          onLoad={handleVideoLoad}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {!isVideoReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Video yükleniyor...</Text>
          </View>
        )}
      </View>

      <View style={styles.changeVideoContainer}>
        <Pressable
          style={styles.changeVideoButton}
          onPress={handleChangeVideo}
          disabled={isChangingVideo || isLoading}
        >
          {isChangingVideo ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Değiştiriliyor...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={styles.buttonText}>Farklı Video Seç</Text>
            </View>
          )}
        </Pressable>
      </View>

      {isVideoReady && (
        <View style={styles.trimmerContainer}>
          <View style={styles.timeInfoContainer}>
            <Text style={styles.timeLabel}>Seçilen Aralık</Text>
            <Text style={styles.timeText}>
              {formatTime(startTime)} - {formatTime(endTime)}
            </Text>
            <Text style={styles.durationText}>
              Toplam: {formatTime(endTime - startTime)}
            </Text>
          </View>

          <View style={styles.currentTimeContainer}>
            <Text style={styles.currentTimeText}>
              Şu anki konum: {formatTime(currentTime)}
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onValueChange={(value) => seekToPosition(value)}
              disabled={disabled || isLoading}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#DDDDDD"
              thumbTintColor="#007AFF"
            />
            <View style={styles.timeMarkersContainer}>
              <Text style={styles.timeMarker}>0:00</Text>
              <Text style={styles.timeMarker}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.markersContainer}>
            <Pressable
              style={[styles.markerButton, styles.startMarker]}
              onPress={setStartPosition}
              disabled={disabled || isLoading}
            >
              <Ionicons name="flag" size={18} color="#fff" />
              <Text style={styles.markerButtonText}>Başlangıç</Text>
            </Pressable>

            <Pressable
              style={[styles.markerButton, styles.endMarker]}
              onPress={setEndPosition}
              disabled={disabled || isLoading}
            >
              <Ionicons name="flag" size={18} color="#fff" />
              <Text style={styles.markerButtonText}>Bitiş</Text>
            </Pressable>
          </View>

          {trimError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{trimError}</Text>
            </View>
          )}

          <Pressable
            style={[
              styles.trimButton,
              (disabled || isLoading) && styles.trimButtonDisabled,
            ]}
            onPress={handleTrim}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.trimButtonText}>Kırpılıyor...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="cut" size={20} color="#fff" />
                <Text style={styles.trimButtonText}>Videoyu Kırp</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: "center",
  },
  preview: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
    backgroundColor: "#000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  changeVideoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  changeVideoButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  trimmerContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeInfoContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  timeLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  durationText: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 4,
  },
  currentTimeContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  currentTimeText: {
    fontSize: 14,
    color: "#6c757d",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeMarkersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  timeMarker: {
    fontSize: 12,
    color: "#6c757d",
  },
  markersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  markerButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    flexDirection: "row",
  },
  startMarker: {
    backgroundColor: "#28a745",
  },
  endMarker: {
    backgroundColor: "#dc3545",
  },
  markerButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: "#FFEEEE",
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  trimButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  trimButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  trimButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
});
