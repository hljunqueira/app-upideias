import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

const { width } = Dimensions.get("window");

export default function LandingPage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const logoScale = useRef(new Animated.Value(0.95)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pulsing/blinking loop for the logo
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1.05,
            duration: 900,
            useNativeDriver: true,
          })
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0.95,
            duration: 900,
            useNativeDriver: true,
          })
        ])
      ])
    ).start();

    // 2. Timeout to transition to landing page after 3 seconds
    const timer = setTimeout(() => {
      // Fade out splash
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        // Fade in landing page content
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }).start();
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.Image
          source={require("../../assets/UP-Logo-removebg-preview.png")}
          style={[styles.splashLogo, { opacity: pulseAnim, transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: contentFade }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/UP-Logo-removebg-preview.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Analytics</Text>
          </View>
          <Text style={styles.tagline}>by UpIdeias</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>
            Sua inteligência de{"\n"}
            dados no <Text style={{ color: "#ff5368" }}>Instagram.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Acompanhe a evolução do seu perfil em tempo real, obtenha diagnósticos profundos e planeje seus próximos passos com relatórios automatizados.
          </Text>
        </View>

        {/* Premium Dashboard Mockup Section */}
        <View style={styles.mockupContainer}>
          <View style={styles.mockupBorder}>
            <Image
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHc7PyYN-u_sFmzUAQCh3cmgY1Ku5v4pVdGlV74ww2ItnIx6dgBuS-xmGjidlPrZPjYbx1vFijTNJU1YsViHGgtwtxzSItsdK_dj18s7Q81JKuwupMwSk3Rwfp84nmmNP4k45AUgS_u-aBLspIjnxRkkqx1JLzgBu27aMFTq2qMrmc1_jEITzxwwQawarnvWWZSZUv6CT-Gbnj4d1UNQAwHJ2ZEkyYPVJu6g36SvR_Q5r_XeCbffSOfOrPRr3pIs4BykhUkMtpvruj" }}
              style={styles.mockupImage}
              resizeMode="cover"
            />
            {/* Floating badge inside mockup */}
            <View style={styles.floatingBadge}>
              <View style={styles.floatingBadgeIconContainer}>
                <Text style={styles.floatingBadgeIcon}>⚡</Text>
              </View>
              <View>
                <Text style={styles.floatingBadgeTitle}>Sincronização</Text>
                <Text style={styles.floatingBadgeSub}>Tempo Real</Text>
              </View>
            </View>
          </View>
        </View>


        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push("/register")}
          >
            <Text style={styles.primaryButtonText}>Começar agora</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push("/login")}
          >
            <Text style={styles.secondaryButtonText}>Já tenho uma conta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.demoLink} 
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.demoLinkText}>✨ Entrar como Demo (1-Clique)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    width: 140,
    height: 140,
  },
  container: {
    flex: 1,
    backgroundColor: "#08080c",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
    position: "relative",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
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
    marginLeft: -25,
  },
  tagline: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: -6,
  },
  heroContainer: {
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  mockupContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  mockupBorder: {
    width: "100%",
    height: 230,
    borderRadius: 20,
    backgroundColor: "#111116",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#ff5368",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  mockupImage: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  floatingBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(17, 17, 22, 0.85)",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  floatingBadgeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 83, 104, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingBadgeIcon: {
    fontSize: 12,
  },
  floatingBadgeTitle: {
    fontSize: 9,
    color: "#e2bebe",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  floatingBadgeSub: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "bold",
  },
  featuresHeader: {
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  featuresSectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  featuresSectionSub: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
  features: {
    gap: 16,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row",
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#202027",
    borderRadius: 20,
    padding: 18,
    gap: 16,
    alignItems: "center",
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1c1c24",
    alignItems: "center",
    justifyContent: "center",
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 18,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#ff5368",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff5368",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#26262d",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#d1d5db",
    fontSize: 14,
    fontWeight: "bold",
  },
  demoLink: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 12,
  },
  demoLinkText: {
    color: "#ff5368",
    fontSize: 14,
    fontWeight: "bold",
  },
});
