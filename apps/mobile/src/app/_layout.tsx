import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#050505" }, // upBlack
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
