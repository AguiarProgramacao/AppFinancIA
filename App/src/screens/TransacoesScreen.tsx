import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from "react-native";
import { Plus, Search, ShoppingBag, Briefcase, Calendar } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { listarTransacoes } from "../services/transacoes";
import DateTimePicker from "@react-native-community/datetimepicker";

type Transacao = {
  id: string;
  tipo: "despesa" | "receita";
  valor: number;
  data: string;
  descricao?: string;
  categoria?: {
    nome?: string;
    cor?: string;
  };
  formaPagamento?: string;
  observacoes?: string;
};

export default function TransacoesScreen() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState<number | null>(null);
  const [filtroAno, setFiltroAno] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [filtroMes, filtroAno])
  );

  async function carregar() {
    try {
      setLoading(true);
      const data = await listarTransacoes(
        filtroMes ?? undefined,
        filtroAno ?? undefined
      );
      setTransacoes(data);
    } catch (e) {
      console.error("Erro ao carregar transações", e);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    try {
      setRefreshing(true);
      await carregar();
    } finally {
      setRefreshing(false);
    }
  }

  type Nav = NativeStackNavigationProp<RootStackParamList, "Transacoes">;
  const navigation = useNavigation<Nav>();

  const [filter, setFilter] = useState<"todas" | "receitas" | "despesas">(
    "todas"
  );
  const [search, setSearch] = useState("");
  const transacoesFiltradas = transacoes.filter((item) => {
    if (filter === "receitas" && item.tipo !== "receita") return false;
    if (filter === "despesas" && item.tipo !== "despesa") return false;
    const termo = search.trim().toLowerCase();
    if (!termo) return true;
    const descricao = String(item.descricao || "").toLowerCase();
    const categoria = String(item.categoria?.nome || "").toLowerCase();
    return descricao.includes(termo) || categoria.includes(termo);
  });
  const gruposPorMes = transacoesFiltradas.reduce((acc, item) => {
    const date = item?.data ? new Date(item.data) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return acc;
    }
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) {
      acc[key] = {
        titulo: date
          .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
          .toUpperCase(),
        items: [],
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { titulo: string; items: Transacao[] }>);
  const gruposOrdenados = Object.keys(gruposPorMes)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({ key, ...gruposPorMes[key] }));

  function formatarMoeda(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarMesAno(date: Date) {
    return date
      .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      .toUpperCase();
  }

  function formatarDataCurta(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
      >

        <View style={{ backgroundColor: "#FFF", paddingHorizontal: 20, paddingBottom: 15 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Transações</Text>

            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("NovaTransacao")}>
              <Plus size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Search size={18} color="#999" style={{ marginRight: 6 }} />
            <TextInput
              placeholder="Buscar transações..."
              style={{ flex: 1 }}
              placeholderTextColor="#AAA"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "todas" && styles.filterActive,
              ]}
              onPress={() => setFilter("todas")}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === "todas" && styles.filterTextActive,
                ]}
              >
                Todas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "receitas" && styles.filterActive,
              ]}
              onPress={() => setFilter("receitas")}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === "receitas" && styles.filterTextActive,
                ]}
              >
                Receitas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "despesas" && styles.filterActive,
              ]}
              onPress={() => setFilter("despesas")}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === "despesas" && styles.filterTextActive,
                ]}
              >
                Despesas
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.periodoBar}>
            <Text style={styles.periodoLabel}>Periodo</Text>
            <View style={styles.periodoActions}>
              <TouchableOpacity style={styles.periodoPill} onPress={() => setShowPicker(true)}>
                <Calendar size={16} color="#2563EB" />
                <Text style={styles.periodoText}>
                  {filtroMes !== null && filtroAno !== null
                    ? formatarMesAno(new Date(filtroAno, filtroMes, 1))
                    : "TODOS OS MESES"}
                </Text>
              </TouchableOpacity>
              {filtroMes !== null && filtroAno !== null && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setFiltroMes(null);
                    setFiltroAno(null);
                  }}
                >
                  <Text style={styles.clearText}>Limpar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
                  setFiltroMes(date.getMonth());
                  setFiltroAno(date.getFullYear());
                }
              }}
            />
          )}

          {gruposOrdenados.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nada por aqui</Text>
              <Text style={styles.emptyText}>
                Nenhuma transacao encontrada neste periodo.
              </Text>
            </View>
          ) : (
            gruposOrdenados.map((grupo) => (
              <View key={grupo.key}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{grupo.titulo}</Text>
                  <Text style={styles.groupCount}>
                    {grupo.items.length} item{grupo.items.length === 1 ? "" : "s"}
                  </Text>
                </View>
                {grupo.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.transactionCard}
                    onPress={() =>
                      navigation.navigate("TransacaoDetalhe", { id: item.id })
                    }
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor:
                            item.tipo === "despesa" ? "#FEE2E2" : "#DCFCE7",
                        },
                      ]}
                    >
                      {item.tipo === "despesa" ? (
                        <ShoppingBag size={20} color="#EF4444" />
                      ) : (
                        <Briefcase size={20} color="#22C55E" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.transactionName}>
                        {item.descricao || item.categoria?.nome}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatarDataCurta(item.data)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.transactionValue,
                        { color: item.tipo === "despesa" ? "#EF4444" : "#22C55E" },
                      ]}
                    >
                      {item.tipo === "despesa" ? "-" : "+"} {formatarMoeda(item.valor)}
                    </Text>
                  </TouchableOpacity>
                ))}
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
    backgroundColor: "#F4F6FB",
  },

  header: {
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  addButton: {
    backgroundColor: "#2563EB",
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  searchBox: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 14
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "transparent",
    borderRadius: 12,
    flex: 1,
  },

  filterActive: {
    backgroundColor: "#FFF",
    elevation: 1,
  },

  filterText: {
    fontSize: 14,
    color: "#1F2937",
    textAlign: "center",
  },

  filterTextActive: {
    color: "#111827",
    fontWeight: "600",
  },

  periodoBar: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  periodoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },

  periodoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  periodoText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 12,
  },

  periodoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },

  clearText: {
    color: "#1D4ED8",
    fontWeight: "600",
    fontSize: 12,
  },

  groupHeader: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  groupTitle: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  groupCount: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },

  transactionCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  transactionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  transactionDate: {
    fontSize: 13,
    color: "#6B7280",
  },

  transactionValue: {
    fontSize: 16,
    fontWeight: "700",
  },

  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  emptyText: {
    color: "#6B7280",
    textAlign: "center",
  },
});














