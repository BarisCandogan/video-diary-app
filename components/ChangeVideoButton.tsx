import React from "react";
import {
  Pressable,
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChangeVideoButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  isChangingVideo?: boolean;
}

const ChangeVideoButton: React.FC<ChangeVideoButtonProps> = ({
  onPress,
  isLoading = false,
  isChangingVideo = false,
}) => {
  return (
    <Pressable
      style={styles.changeVideoButton}
      onPress={onPress}
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
  );
};

const styles = StyleSheet.create({
  changeVideoButton: {
    backgroundColor: "grey", // Buton rengi
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 16, // Üstten boşluk
    alignSelf: "center", // Butonu ortala
    elevation: 2, // Gölge efekti
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
});

export default ChangeVideoButton;
