import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Sparkles, ShieldCheck, Heart, Github, Mail, ArrowRight } from "lucide-react-native";

export default function AboutScreen({ navigation }: any) {
  const suporteEmail = "programacaoaguiar@gmail.com";

  async function handleSuporte() {
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(suporteEmail)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Suporte", "Nao foi possivel abrir o suporte.");
      return;
    }
    await Linking.openURL(url);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Image source={require("../../assets/logo1.png")} style={styles.logo} />
            </View>
            <Text style={styles.appName}>FinancIA</Text>
            <Text style={styles.appVersion}>Versao 1.0.0</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#E0ECFF" }]}>
              <Sparkles size={20} color="#3B82F6" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Inteligência Artificial</Text>
              <Text style={styles.cardSubtitle}>
                Insights personalizados e sugestoes inteligentes para melhorar suas 
                financas.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#ECFDF5" }]}>
              <ShieldCheck size={20} color="#22C55E" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Segurança</Text>
              <Text style={styles.cardSubtitle}>
                Seus dados são criptografádos e protegidos com as melhores práticas.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#F5F3FF" }]}>
              <Heart size={20} color="#8B5CF6" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Feito com Carinho</Text>
              <Text style={styles.cardSubtitle}>
                Desenvolvido com dedicação para ajudar você a alcançar seus objetivos.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.linkCard} onPress={handleSuporte}>
            <View style={[styles.iconWrap, { backgroundColor: "#F3F4F6" }]}>
              <Mail size={20} color="#111827" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Suporte</Text>
              <Text style={styles.cardSubtitle}>{suporteEmail}</Text>
            </View>
            <ArrowRight size={18} />
          </TouchableOpacity>

          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Termos de Uso</Text>
            <Text style={styles.footerDivider}>•</Text>
            <Text style={styles.footerLink}>Politica de Privacidade</Text>
          </View>
          <Text style={styles.footerCopy}>© 2026 FinancIA. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
    height: 80,
    gap: 10,
  },
  logo: {
    width: 170,
    height: 170,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  logoWrap: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  logoLetter: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFF",
  },
  appName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  appVersion: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 14,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    color: "#6B7280",
  },
  footerDivider: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  footerCopy: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
  },
});
