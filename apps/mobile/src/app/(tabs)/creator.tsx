import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

export default function MobileCreator() {
  const courses = [
    { 
      id: 1, 
      title: "Dominando o Instagram", 
      desc: "Aprenda os segredos do algoritmo e estrutura de marca.", 
      category: "Fundamentos", 
      status: "Acessível", 
      progress: 60 
    },
    { 
      id: 2, 
      title: "Estratégia e Métricas de Alto Impacto", 
      desc: "Analise dados reais para conversão de vendas.", 
      category: "Estratégia", 
      status: "Acessível", 
      progress: 20 
    },
    { 
      id: 3, 
      title: "SaaS e Escala para Agências", 
      desc: "Gerencie múltiplos clientes de forma profissional.", 
      category: "Agências", 
      status: "Bloqueado", 
      progress: 0 
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>UP Creator</Text>
      <Text style={styles.subtitle}>Sua área de treinamento estratégica - by UpIdeias</Text>

      <View style={styles.list}>
        {courses.map((course) => (
          <View key={course.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardCategory}>{course.category}</Text>
              <Text style={[
                styles.cardStatus,
                course.status === "Bloqueado" ? styles.statusLocked : styles.statusActive
              ]}>
                {course.status}
              </Text>
            </View>

            <Text style={styles.cardTitle}>{course.title}</Text>
            <Text style={styles.cardDesc}>{course.desc}</Text>

            {/* Progress Bar */}
            {course.status !== "Bloqueado" && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarWrapper}>
                  <View style={[styles.progressBar, { width: `${course.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{course.progress}% concluído</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.button,
                course.status === "Bloqueado" ? styles.buttonDisabled : {}
              ]}
              disabled={course.status === "Bloqueado"}
            >
              <Text style={styles.buttonText}>
                {course.status === "Bloqueado" ? "🔒 Bloqueado" : "Assistir Aulas"}
              </Text>
            </TouchableOpacity>
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
    gap: 20,
  },
  card: {
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  cardStatus: {
    fontSize: 9,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusActive: {
    color: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  statusLocked: {
    color: "#ff5368",
    backgroundColor: "rgba(255, 83, 104, 0.1)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 18,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  progressBarWrapper: {
    flex: 1,
    height: 6,
    backgroundColor: "#26262d",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ff5368",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#ff5368",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#26262d",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
