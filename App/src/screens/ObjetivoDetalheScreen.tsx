import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ArrowLeft, DollarSign, Plus, Pencil, Trash2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import {
  buscarObjetivoPorId,
  criarAporte,
  deletarObjetivo,
  Aporte,
  Objetivo,
} from "../services/objetivos";
import { getErrorMessage } from "../utils/errors";

export default function ObjetivoDetalheScreen({ navigation }: any) {
  const route = useRoute<any>();
  const { id } = route.params;

  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [valorCentavos, setValorCentavos] = useState(0);

  async function carregar() {
    try {
      const data = await buscarObjetivoPorId(id);
      setObjetivo(data);
    } catch (err: any) {
      Alert.alert(
        "Erro",
        getErrorMessage(err, "Nao foi possivel carregar o objetivo.")
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  if (loading || !objetivo) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const percentual = Math.round(
    (objetivo.economizado / objetivo.meta) * 100
  );

  const falta = objetivo.meta - objetivo.economizado;

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarMoedaCentavos(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <LinearGradient
          colors={["#5B8CFF", "#8B5CF6"]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalhes do Objetivo</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={() => navigation.navigate("ObjetivoForm", { id })}
              >
                <Pencil size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={() => {
                  Alert.alert(
                    "Excluir objetivo",
                    "Tem certeza que deseja excluir este objetivo?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Excluir",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await deletarObjetivo(id);
                            navigation.goBack();
                          } catch (e: any) {
                            Alert.alert(
                              "Erro",
                              getErrorMessage(
                                e,
                                "Nao foi possivel excluir o objetivo."
                              )
                            );
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Trash2 size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.nome}>{objetivo.nome}</Text>

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progresso</Text>
              <Text style={styles.progressPercent}>{percentual}%</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[styles.progressFill, { width: `${percentual}%` }]}
              />
            </View>

            <View style={styles.valuesRow}>
              <View>
                <Text style={styles.valueLabel}>Economizado</Text>
                <Text style={styles.valueMoney}>
                  {formatarMoeda(objetivo.economizado)}
                </Text>
              </View>

              <View>
                <Text style={styles.valueLabel}>Meta</Text>
                <Text style={styles.valueMoney}>
                  {formatarMoeda(objetivo.meta)}
                </Text>
              </View>
            </View>

            <Text style={styles.prazo}>
              Prazo{" "}
              <Text style={{ fontWeight: "700" }}>
                {new Date(objetivo.dataLimite).toLocaleDateString("pt-BR")}
              </Text>
            </Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Adicionar Contribuição</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Depositado</Text>
            <Text style={styles.summaryValue}>
              {formatarMoeda(objetivo.economizado)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Falta</Text>
            <Text style={styles.summaryValue}>
              {formatarMoeda(falta)}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={styles.sectionTitle}>
            Histórico de Contribuições
          </Text>

          {objetivo.aportes && objetivo.aportes.length > 0 ? (
            objetivo.aportes.map((aporte: Aporte) => (
              <View key={aporte.id} style={styles.aporteCard}>
                <View style={{ flexDirection: "row", gap:8 }}>
                  <View style={{ backgroundColor: "#aff8ca9f", alignItems: "center", justifyContent: "center", padding: 10, borderRadius: 8 }}>
                    <DollarSign color={"#0a642bff"}/>
                  </View>
                  <View>
                    <Text style={styles.aporteValor}>
                      + {formatarMoeda(aporte.valor)}
                    </Text>
                    <Text style={styles.aporteData}>
                      {new Date(aporte.data).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma contribuição registrada ainda
            </Text>
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Lançamento</Text>

            <TextInput
              keyboardType="numeric"
              value={formatarMoedaCentavos(valorCentavos)}
              onChangeText={(text) => {
                const apenasNumeros = text.replace(/\D/g, "");
                setValorCentavos(Number(apenasNumeros));
              }}
              style={styles.valorInput}
              autoFocus
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setValorCentavos(0);
                }}
              >
                <Text style={styles.cancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={async () => {
                  if (valorCentavos <= 0) return;

                  try {
                    await criarAporte(
                      objetivo.id,
                      valorCentavos / 100
                    );

                    setModalVisible(false);
                    setValorCentavos(0);
                    carregar();
                  } catch (e: any) {
                    Alert.alert(
                      "Erro",
                      getErrorMessage(
                        e,
                        "Nao foi possivel salvar o aporte."
                      )
                    );
                  }
                }}
              >
                <Text style={styles.confirmText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },

  nome: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  progressLabel: {
    color: "#EDE9FE",
  },

  progressPercent: {
    color: "#FFF",
    fontWeight: "700",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 6,
    marginBottom: 16,
  },

  progressFill: {
    height: 8,
    backgroundColor: "#FFF",
    borderRadius: 6,
  },

  valuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  valueLabel: {
    color: "#EDE9FE",
    fontSize: 13,
  },

  valueMoney: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  prazo: {
    color: "#EDE9FE",
    marginTop: 8,
  },

  addButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
  },

  summaryLabel: {
    color: "#666",
    fontSize: 13,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  aporteCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  aporteValor: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16A34A",
  },

  aporteData: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  valorInput: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 24,
    color: "#111",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  cancel: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#999",
    padding: 8,
  },

  confirmButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: "#8B5CF6",
    borderRadius: 6,
  },

  confirmText: {
    color: "#FFF"
  },

  loading: {

  },

  emptyText: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },

});
