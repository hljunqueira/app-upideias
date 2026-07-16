import { Tabs } from "expo-router";
import { View, Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0b0b0f", // upDark
          borderTopColor: "#26262d", // upBorder
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#ff5368", // upPink
        tabBarInactiveTintColor: "#6b7280", // upGray
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: "Posts",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📝</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "IA Estratégia",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🧠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="creator"
        options={{
          title: "UP Creator",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🎓</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
