import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getStatusLabel } from "@up-analytics/lib";

export default function MobilePosts() {
  const posts = [
    { 
      id: 1, 
      caption: "3 Hacks de Social Media que você não conhecia 🚀", 
      type: "Reels", 
      status: "published", 
      reach: "18.4k", 
      likes: "1.2k" 
    },
    { 
      id: 2, 
      caption: "Estratégia vs. Postagem Aleatória: O que funciona?", 
      type: "Carrossel", 
      status: "published", 
      reach: "12.1k", 
      likes: "980" 
    },
    { 
      id: 3, 
      caption: "Como estruturar um funil de conteúdo no Reels", 
      type: "Reels", 
      status: "pending", 
      reach: "0", 
      likes: "0" 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "#10b981";
      case "pending": return "#ff9f43";
      default: return "#6b7280";
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Suas Publicações</Text>
      <Text style={styles.subtitle}>Listagem de mídias e métricas individuais.</Text>

      <View style={styles.list}>
        {posts.map((post) => (
          <View key={post.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>{post.type}</Text>
              
              <View style={[styles.badge, { borderColor: getStatusColor(post.status) }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(post.status) }]}>
                  {getStatusLabel(post.status)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.cardText} numberOfLines={2}>
              {post.caption}
            </Text>

            {post.status === "published" && (
              <View style={styles.metricsRow}>
                <Text style={styles.metricText}>❤️ {post.likes} curtidas</Text>
                <Text style={styles.metricText}>👁️ {post.reach} alcance</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 30,
  },
  list: {
    gap: 15,
  },
  card: {
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardType: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ff5368",
    backgroundColor: "rgba(255, 83, 104, 0.1)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardText: {
    fontSize: 13,
    color: "#ffffff",
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(38, 38, 45, 0.5)",
  },
  metricText: {
    fontSize: 11,
    color: "#6b7280",
  },
});
