import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useVideoStore } from "../hooks/useVideoStore";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { loadVideos } = useVideoStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    loadVideos();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="video/[id]"
              options={{
                title: "Video Detayı",
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="video/[id]/edit"
              options={{
                title: "Video Düzenle",
                presentation: "card",
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
