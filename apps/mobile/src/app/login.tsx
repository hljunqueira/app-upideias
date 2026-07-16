import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function MobileLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.replace("/(tabs)");
  };

  const handleDemoLogin = () => {
    setEmail("demo@upideias.com");
    setPassword("123456");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/UP-Logo-removebg-preview.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Analytics</Text>
          </View>
          <Text style={styles.subTitle}>by UpIdeias</Text>
          <Text style={styles.title}>Entrar na sua conta</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
            <Text style={styles.demoButtonText}>✨ Acessar como Demonstração</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.registerText}>
            Não tem uma conta? <Text style={{ color: "#ff5368", fontWeight: "bold" }}>Criar conta</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 12,
    marginLeft: -10,
  },
  subTitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: -6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 25,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  input: {
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: "#ffffff",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#ff5368",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  registerLink: {
    alignItems: "center",
    marginTop: 30,
  },
  registerText: {
    fontSize: 12,
    color: "#6b7280",
  },
  demoButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#26262d",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  demoButtonText: {
    color: "#ff5368",
    fontSize: 13,
    fontWeight: "bold",
  },
});
