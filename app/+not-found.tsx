import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../utils/Colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Sayfa Bulunamadı" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Sayfa bulunamadı!</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Ana sayfaya dön</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
  },
});
