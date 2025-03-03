import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../utils/Colors";

interface HeaderProps {
  title: string;
  showDeleteButton?: boolean;
  onDeleteAll?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showDeleteButton,
  onDeleteAll,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {showDeleteButton && onDeleteAll && (
        <Pressable style={styles.deleteAllButton} onPress={onDeleteAll}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={styles.deleteAllText}>Tümünü Sil</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  deleteAllButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  deleteAllText: {
    marginLeft: 4,
    color: Colors.error,
    fontWeight: "600",
  },
});

export default Header;
