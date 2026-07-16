import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { generateContentIdeas } from "@up-analytics/lib";
import { ContentIdea } from "@up-analytics/types";

export default function MobileAiHub() {
  const [niche, setNiche] = useState("");
  const [objective, setObjective] = useState("Engajamento");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);

  const handleGenerate = async () => {
    if (!niche) return;
    setLoading(true);
    try {
      const data = await generateContentIdeas(niche, objective);
      setIdeas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Estratégia e IA</Text>
      <Text style={styles.subtitle}>Gere legendas, roteiros e planeje sua semana editorial.</Text>

      {/* Generator launcher */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✨ Gerador de Conteúdo</Text>
        <Text style={styles.cardDesc}>
          Crie copys persuasivas, ganchos magnéticos e roteiros de Reels customizados para seu nicho.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Desenvolvimento Web, Finanças"
          placeholderTextColor="#6b7280"
          value={niche}
          onChangeText={setNiche}
        />

        <TouchableOpacity 
          style={[styles.button, !niche ? styles.buttonDisabled : {}]} 
          onPress={handleGenerate}
          disabled={loading || !niche}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Gerar com Gemini</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Output results */}
      {ideas.map((idea) => (
        <View key={idea.id} style={styles.card}>
          <View style={styles.ideaHeader}>
            <Text style={styles.ideaFormat}>{idea.format}</Text>
            <Text style={styles.ideaTheme}>{idea.theme}</Text>
          </View>

          {idea.hook && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>GANCHO INICIAL</Text>
              <Text style={styles.sectionText}>"{idea.hook}"</Text>
            </View>
          )}

          {idea.caption && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionLabel}>LEGENDA SUGERIDA</Text>
              <Text style={styles.sectionText}>{idea.caption}</Text>
            </View>
          )}
        </View>
      ))}
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
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 12,
    padding: 12,
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#ff5368",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  ideaHeader: {
    marginBottom: 15,
  },
  ideaFormat: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ff5368",
    backgroundColor: "rgba(255, 83, 104, 0.1)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  ideaTheme: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sectionBox: {
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 12,
    color: "#d1d5db",
    lineHeight: 16,
  },
});
