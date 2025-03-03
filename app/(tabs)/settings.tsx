import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useVideoStore } from "../../hooks/useVideoStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../utils/Colors";

export default function SettingsScreen() {
  const { videos } = useVideoStore();

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
    color: Colors.primary,
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
    backgroundColor: Colors.error,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
