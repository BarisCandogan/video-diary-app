import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useVideoStore } from "../../hooks/useVideoStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const { videos } = useVideoStore();

  const clearAllData = async () => {
    Alert.alert(
      "Tüm Verileri Sil",
      "Tüm videolar ve ayarlar silinecek. Bu işlem geri alınamaz.",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // Uygulama yeniden başlatılmalı
              Alert.alert(
                "Başarılı",
                "Tüm veriler silindi. Uygulamayı yeniden başlatın."
              );
            } catch (error) {
              Alert.alert("Hata", "Veriler silinirken bir hata oluştu");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İstatistikler</Text>
        <Text style={styles.stat}>Toplam Video: {videos.length}</Text>
        <Text style={styles.stat}>
          Toplam Süre: {videos.reduce((acc, video) => acc + video.duration, 0)}{" "}
          saniye
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 40,
    color: "#007AFF",
    fontWeight: "bold",
    marginBottom: 12,
  },
  stat: {
    textAlign: "center",

    fontWeight: "300",
    fontSize: 26,
    marginBottom: 8,
    color: "#666",
  },
  info: {
    fontSize: 16,
    color: "#666",
  },
  dangerButton: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
