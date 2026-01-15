import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Wallet, ArrowUpCircle, ArrowDownCircle, BarChart2, Minus, Plus, Target, FileText, Calendar, DollarSign, AlertTriangle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BarChart, { BarDatum } from "../components/BarChart";
import { buscarResumoDashboard } from "../services/dashboard";

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insights = Array.isArray(data?.insights) ? data.insights : [];

  async function carregar(mesAtual: number, anoAtual: number) {
    try {
      const res = await buscarResumoDashboard(mesAtual, anoAtual);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    try {
      setRefreshing(true);
      await carregar(mes, ano);
    } finally {
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      carregar(mes, ano);
    }, [mes, ano])
  );

  if (loading || !data) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  function buildBarData(): BarDatum[] {
    const transacoes = Array.isArray(data?.ultimasTransacoes) ? data.ultimasTransacoes : [];
    const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const months = Array.from({ length: 3 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (2 - index), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: monthLabels[date.getMonth()],
      };
    });

    const grouped = new Map<string, { receita: number; despesa: number }>();
    months.forEach((m) => grouped.set(m.key, { receita: 0, despesa: 0 }));

    transacoes.forEach((item: any) => {
      const valor = Number(item?.valor ?? 0);
      if (!Number.isFinite(valor)) {
        return;
      }
      const date = item?.data ? new Date(item.data) : null;
      if (!date || Number.isNaN(date.getTime())) {
        return;
      }
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped.has(key)) {
        return;
      }
      const entry = grouped.get(key)!;
      if (item?.tipo === "despesa") {
        entry.despesa += Math.abs(valor);
      } else {
        entry.receita += Math.abs(valor);
      }
    });

    const hasData = Array.from(grouped.values()).some((v) => v.receita > 0 || v.despesa > 0);
    if (!hasData) {
      const receitas = Number(data?.receitas ?? 0);
      const despesas = Number(data?.despesas ?? 0);
      return [
        { receita: receitas, despesa: despesas, label: monthLabels[now.getMonth()] },
      ];
    }

    return months.map((month) => {
      const values = grouped.get(month.key) ?? { receita: 0, despesa: 0 };
      return { receita: values.receita, despesa: values.despesa, label: month.label };
    });
  }

  function formatarMoeda(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#3B82F6" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
            colors={["#3B82F6"]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Saldo Total:</Text>
            <Text style={styles.headerValue}>{formatarMoeda(data.saldo ?? 0)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.headerMonth}>
                {new Date(ano, mes).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>

              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Calendar size={18} color="#FFF" />
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={new Date(ano, mes, 1)}
                  mode="date"
                  display="spinner"
                  onChange={(_, date) => {
                    setShowPicker(false);
                    if (date) {
                      setMes(date.getMonth());
                      setAno(date.getFullYear());
                    }
                  }}
                />
              )}

            </View>

          </View>

          <View style={styles.headerIcon}>
            <Wallet size={36} color="#30f100ff" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "space-between" }}>
              <Text style={styles.cardTitle}>Entradas </Text>
              <ArrowUpCircle size={20} color="#22c55e" />
            </View>
            <Text style={[styles.cardValue, { color: "#22c55e" }]}>{formatarMoeda(data.receitas ?? 0)}</Text>
          </View>

          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "space-between" }}>
              <Text style={styles.cardTitle}>Saídas</Text>
              <ArrowDownCircle size={20} color="#ef4444" />
            </View>
            <Text style={[styles.cardValue, { color: "#ef4444" }]}>{formatarMoeda(data.despesas ?? 0)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fluxo Mensal</Text>
            <BarChart2 size={20} color="#555" />
          </View>

          <BarChart data={buildBarData()} height={160} />

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickAction]}
              onPress={() => navigation.navigate("NovaTransacao", { tipo: "despesa" })}
            >
              <View style={[styles.boxIcon, { backgroundColor: "#EEF2FF" }]}>
                <Minus color="#4F46E5" />
              </View>
              <Text style={styles.quickLabel}>Despesa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("NovaTransacao", { tipo: "receita" })}
            >
              <View style={[styles.boxIcon, { backgroundColor: "#ECFDF5" }]}>
                <Plus color="#22C55E" />
              </View>
              <Text style={styles.quickLabel}>Receita</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("Objetivos")}>
              <View style={[styles.boxIcon, { backgroundColor: "#F5F3FF" }]}>
                <Target color="#7C3AED" />
              </View>
              <Text style={styles.quickLabel}>Objetivo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate("Gráficos")}>
              <View style={[styles.boxIcon, { backgroundColor: "#FFF7ED" }]}>
                <FileText color="#F97316" />
              </View>
              <Text style={styles.quickLabel}>Extrato</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.sectionIA}>
          <View style={styles.insightHeader}>
            <Text style={styles.sectionTitle}>Insights da IA</Text>
            {insights.length > 0 && (
              <View style={styles.badgeNew}>
                <Text style={styles.badgeText}>NOVO</Text>
              </View>
            )}
          </View>
          {insights.length === 0 ? (
            <View style={styles.insightCard}>
              <Text style={styles.insightEmoji}>!</Text>
              <Text style={styles.insightText}>Sem insights por enquanto.</Text>
            </View>
          ) : (
            insights.map((insight: any) => (
              <View key={insight.id} style={styles.insightCard}>
                <Text style={styles.insightEmoji}>
                  {insight.tipo === "objetivo" ? <DollarSign /> : <AlertTriangle />}
                </Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>{insight.titulo}</Text>
                  <Text style={styles.insightText}>{insight.mensagem}</Text>
                </View>
              </View>
            ))
          )}
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
    backgroundColor: "#3B82F6",
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 200
  },

  headerTitle: {
    color: "#E0ECFF",
    fontSize: 14,
  },

  headerValue: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 4,
  },

  headerMonth: {
    color: "#E0ECFF",
    marginTop: 4,
  },

  headerIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 14,
    borderRadius: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -30,
  },

  card: {
    backgroundColor: "#FFF",
    width: "48%",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 16,
    elevation: 3,
  },

  cardTitle: {
    color: "#555",
    marginBottom: 6,
  },

  cardValue: {
    fontSize: 22,
    fontWeight: "700",
  },

  section: {
    backgroundColor: "#FFF",
    marginTop: 18,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20
  },

  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 20,
    height: 130,
    marginBottom: 10,
    justifyContent: "flex-start",
  },

  chartBar: {
    width: 24,
    height: 80,
    backgroundColor: "#3B82F6",
    borderRadius: 6,
  },

  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  chartLabel: {
    color: "#555",
    fontSize: 12,
  },

  actionButton: {
    marginTop: 12,
    backgroundColor: "#F0F4FF",
    paddingVertical: 14,
    borderRadius: 10,
  },

  actionButtonText: {
    textAlign: "center",
    color: "#3B82F6",
    fontSize: 15,
    fontWeight: "600",
  },

  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  quickAction: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  boxIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  quickIcon: {
    fontSize: 22,
    fontWeight: "700",
  },

  quickLabel: {
    fontSize: 12,
    marginTop: 6,
    color: "#444",
    textAlign: "center",
  },

  sectionIA: {
    marginTop: 18,
    marginHorizontal: 20,
  },

  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  badgeNew: {
    backgroundColor: "#E9D5FF",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 20
  },

  badgeText: {
    fontSize: 12,
    color: "#7E22CE",
    fontWeight: "600",
  },

  insightCard: {
    backgroundColor: "#f3ecff",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    color: "#333",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },

  insightEmoji: {
    fontSize: 20,
    padding: 15,
    backgroundColor: "#e4c5ff",
    borderRadius: 8
  },

  insightText: {
    color: "#444",
    fontSize: 14,
    flex: 1,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});






