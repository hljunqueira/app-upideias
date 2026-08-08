import { Text, View, StyleSheet, Image } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Image 
          source={require('../../../assets/icon.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.ideiasText}>ideias</Text>
      </View>
      <Text style={styles.subtitle}>Transforme métricas em estratégia</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 64, height: 64 },
  ideiasText: { fontSize: 42, fontStyle: 'italic', fontWeight: '600', color: '#ffffff', marginLeft: -8 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 16 },
});
