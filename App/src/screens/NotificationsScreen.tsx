import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Bell, Target, CreditCard, Mail, FileText } from "lucide-react-native";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../services/notifications";
import { getErrorMessage } from "../utils/errors";

export default function NotificationsScreen({ navigation }: any) {
  const [progressoObjetivos, setProgressoObjetivos] = useState(false);
  const [novasTransacoes, setNovasTransacoes] = useState(false);
  const [notificacoesGerais, setNotificacoesGerais] = useState(true);
  const [relatorioSemanal, setRelatorioSemanal] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      const data = await getNotificationPreferences();
      setProgressoObjetivos(!!data.notificacoesPushObjetivos);
      setNovasTransacoes(!!data.notificacoesPushTransacoes);
      setNotificacoesGerais(!!data.notificacoesEmailGerais);
      setRelatorioSemanal(!!data.notificacoesEmailRelatorio);
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel carregar."));
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(
    key:
      | "notificacoesPushObjetivos"
      | "notificacoesPushTransacoes"
      | "notificacoesEmailGerais"
      | "notificacoesEmailRelatorio",
    value: boolean
  ) {
    const previous = {
      notificacoesPushObjetivos: progressoObjetivos,
      notificacoesPushTransacoes: novasTransacoes,
      notificacoesEmailGerais: notificacoesGerais,
      notificacoesEmailRelatorio: relatorioSemanal,
    };

    if (key === "notificacoesPushObjetivos") setProgressoObjetivos(value);
    if (key === "notificacoesPushTransacoes") setNovasTransacoes(value);
    if (key === "notificacoesEmailGerais") setNotificacoesGerais(value);
    if (key === "notificacoesEmailRelatorio") setRelatorioSemanal(value);

    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (err: any) {
      setProgressoObjetivos(previous.notificacoesPushObjetivos);
      setNovasTransacoes(previous.notificacoesPushTransacoes);
      setNotificacoesGerais(previous.notificacoesEmailGerais);
      setRelatorioSemanal(previous.notificacoesEmailRelatorio);
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel salvar."));
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificações</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICAÇÕES PUSH</Text>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#F3E8FF" }]}>
              <Target size={18} color="#8B5CF6" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Progresso de Objetivos</Text>
              <Text style={styles.cardSubtitle}>Atualizacoes sobre suas metas</Text>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={progressoObjetivos}
                onValueChange={(value) =>
                  handleToggle("notificacoesPushObjetivos", value)
                }
                trackColor={{ false: "#E5E7EB", true: "#D8B4FE" }}
                thumbColor={progressoObjetivos ? "#8B5CF6" : "#FFF"}
              />
            )}
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#DBEAFE" }]}>
              <CreditCard size={18} color="#3B82F6" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Novas Transações</Text>
              <Text style={styles.cardSubtitle}>Notificamos cada transação registrada</Text>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={novasTransacoes}
                onValueChange={(value) =>
                  handleToggle("notificacoesPushTransacoes", value)
                }
                trackColor={{ false: "#E5E7EB", true: "#BFDBFE" }}
                thumbColor={novasTransacoes ? "#3B82F6" : "#FFF"}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICAÇÕES POR E-MAIL</Text>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#DCFCE7" }]}>
              <Mail size={18} color="#22C55E" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Notificações Gerais</Text>
              <Text style={styles.cardSubtitle}>Novidades e atualizações do app</Text>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={notificacoesGerais}
                onValueChange={(value) =>
                  handleToggle("notificacoesEmailGerais", value)
                }
                trackColor={{ false: "#E5E7EB", true: "#BBF7D0" }}
                thumbColor={notificacoesGerais ? "#22C55E" : "#FFF"}
              />
            )}
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#EEF2FF" }]}>
              <FileText size={18} color="#6366F1" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Relatório Semanal</Text>
              <Text style={styles.cardSubtitle}>Resumo das suas finanças toda semana</Text>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={relatorioSemanal}
                onValueChange={(value) =>
                  handleToggle("notificacoesEmailRelatorio", value)
                }
                trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
                thumbColor={relatorioSemanal ? "#6366F1" : "#FFF"}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
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
});
