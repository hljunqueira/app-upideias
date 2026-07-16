import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function MobileRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    router.replace("/(tabs)");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        <Text style={styles.title}>Criar sua conta</Text>
        <Text style={styles.desc}>Experimente grátis por 7 dias</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />
        </View>

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
          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            style={styles.input}
            placeholder="(11) 99999-9999"
            placeholderTextColor="#6b7280"
            keyboardType="phone-pad"
            value={whatsapp}
            onChangeText={setWhatsapp}
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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.loginLink}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginText}>
          Já tem uma conta? <Text style={{ color: "#ff5368", fontWeight: "bold" }}>Fazer login</Text>
        </Text>
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
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 35,
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
  desc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "#ffffff",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#ff5368",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 25,
  },
  loginText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
