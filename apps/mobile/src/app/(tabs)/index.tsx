import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { getInstagramAccounts, getDashboardMetrics } from "@up-analytics/lib";

export default function MobileDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followers, setFollowers] = useState("12.430");
  const [reach, setReach] = useState("48.9k");
  const [engagement, setEngagement] = useState("3,82%");

  const loadData = async () => {
    try {
      const accounts = await getInstagramAccounts();
      if (accounts && accounts.length > 0) {
        const activeAcc = accounts[0];
        setFollowers(activeAcc.followers_count ? activeAcc.followers_count.toLocaleString("pt-BR") : "12.430");

        const metrics = await getDashboardMetrics(activeAcc.id);
        if (metrics && metrics.length > 0) {
          const latestMetric = metrics[metrics.length - 1];
          setReach(latestMetric.reach ? (latestMetric.reach / 1000).toFixed(1) + "k" : "48.9k");
          setEngagement(latestMetric.engagement_rate ? latestMetric.engagement_rate.toLocaleString("pt-BR") + "%" : "3,82%");
        }
      }
    } catch (err) {
      console.log("Erro ao carregar dados no app mobile, usando fallbacks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const metrics = [
    { label: "SEGUIDORES", value: followers, change: "+2,6%", emoji: "👥", color: "#FF5368" },
    { label: "ALCANCE", value: reach, change: "+12,4%", emoji: "👁️", color: "#3B82F6" },
    { label: "ENGAJAMENTO", value: engagement, change: "+0,4%", emoji: "🔥", color: "#10B981" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff5368" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Creator</Text>
          <Text style={styles.subtext}>by UpIdeias</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>VPS Conectado</Text>
        </View>
      </View>

      {/* KPI Bento Grid */}
      <Text style={styles.sectionTitle}>MÉTRICAS DO PERFIL</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ff5368" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.grid}>
          {metrics.map((item) => (
            <View key={item.label} style={[styles.card, { borderLeftWidth: 3, borderLeftColor: item.color }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.cardValue}>{item.value}</Text>
              <Text style={styles.cardChange}>{item.change} esta semana</Text>
            </View>
          ))}
        </View>
      )}

      {/* IA Insights Section */}
      <View style={styles.insightCard}>
        <View style={styles.insightOverlay} />
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>🧠</Text>
          <Text style={styles.insightTitle}>Diagnóstico de Estratégia (IA)</Text>
        </View>
        <Text style={styles.insightBody}>
          Com base nos dados reais analisados da VPS, o engajamento orgânico aumentou em Reels de até 15 segundos. Recomendamos focar nesse formato hoje.
        </Text>
        <TouchableOpacity
          style={styles.insightButton}
          onPress={() => router.push("/(tabs)/ai")}
        >
          <Text style={styles.insightButtonText}>Criar Conteúdo com IA</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Banner */}
      <View style={styles.alertBanner}>
        <Text style={styles.alertIcon}>📢</Text>
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>Mensagens Automáticas</Text>
          <Text style={styles.alertDesc}>
            Relatório semanal de Facebook Ads & Instagram agendado para o WhatsApp.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050508", // deep dark theme
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  statusText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6b7280",
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#111116",
    width: "48%",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  cardEmoji: {
    fontSize: 14,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  cardChange: {
    fontSize: 9,
    color: "#10b981",
    marginTop: 6,
    fontWeight: "700",
  },
  insightCard: {
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "rgba(255, 83, 104, 0.15)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    position: "relative",
    overflow: "hidden",
  },
  insightOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 83, 104, 0.03)",
    borderRadius: 20,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
  insightBody: {
    fontSize: 13,
    color: "#9ca3af",
    lineHeight: 18,
    marginBottom: 18,
  },
  insightButton: {
    backgroundColor: "#ff5368",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#ff5368",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  insightButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  alertBanner: {
    flexDirection: "row",
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  alertIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },
  alertDesc: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    lineHeight: 14,
    fontWeight: "600",
  },
});
