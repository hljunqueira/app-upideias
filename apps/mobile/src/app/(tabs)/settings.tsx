import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function MobileSettings() {
  const router = useRouter();
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [performanceAlerts, setPerformanceAlerts] = useState(true);

  const handleLogout = () => {
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Configurações</Text>
      <Text style={styles.subtitle}>Gerencie suas preferências de automação e conta.</Text>

      {/* User Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Sua Conta</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Nome</Text>
          <Text style={styles.rowValue}>Olá, Creator</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Plano</Text>
          <Text style={styles.rowValue}>Pro</Text>
        </View>
      </View>

      {/* WhatsApp Automation Preferences */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Alertas e Mensagens Automáticas</Text>
        <View style={[styles.row, styles.rowBetween]}>
          <View style={styles.switchCol}>
            <Text style={styles.rowLabel}>Relatório Semanal</Text>
            <Text style={styles.rowDesc}>Métricas consolidadas por WhatsApp.</Text>
          </View>
          <Switch 
            value={weeklyReport} 
            onValueChange={setWeeklyReport}
            trackColor={{ false: "#26262d", true: "#ff5368" }}
            thumbColor={weeklyReport ? "#ffffff" : "#6b7280"}
          />
        </View>
        <View style={[styles.row, styles.rowBetween]}>
          <View style={styles.switchCol}>
            <Text style={styles.rowLabel}>Alertas Inteligentes</Text>
            <Text style={styles.rowDesc}>Notificações de queda de alcance.</Text>
          </View>
          <Switch 
            value={performanceAlerts} 
            onValueChange={setPerformanceAlerts}
            trackColor={{ false: "#26262d", true: "#ff5368" }}
            thumbColor={performanceAlerts ? "#ffffff" : "#6b7280"}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
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
  sectionCard: {
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ff5368",
    letterSpacing: 1,
    marginBottom: 15,
    textTransform: "uppercase",
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#26262d",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
  rowValue: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  switchCol: {
    flex: 1,
    paddingRight: 10,
  },
  rowDesc: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "rgba(255, 83, 104, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 83, 104, 0.2)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#ff5368",
    fontSize: 13,
    fontWeight: "bold",
  },
});
