import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Plus, Plane, Heart } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { listarObjetivos, Objetivo } from "../services/objetivos";

type Nav = NativeStackNavigationProp<RootStackParamList, "Objetivos">;

export default function ObjetivosScreen() {
  const navigation = useNavigation<Nav>();

  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    try {
      const data = await listarObjetivos();
      setObjetivos(data);
    } catch (e) {
      console.error("Erro ao carregar objetivos", e);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  function percentual(obj: Objetivo) {
    if (!obj.meta) return 0;
    return Math.round((obj.economizado / obj.meta) * 100);
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function iconeObjetivo(nome: string) {
    if (nome.toLowerCase().includes("viagem")) {
      return <Plane size={26} color="#FFF" />;
    }
    return <Heart size={26} color="#FFF" />;
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Meus Objetivos</Text>
            <Text style={styles.subtitle}>
              {objetivos.length} objetivos cadastrados
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("ObjetivoForm")}
          >
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {objetivos.map((obj) => {
            const percRaw = percentual(obj);
            const perc = Math.min(100, Math.max(0, percRaw));

            return (
              <TouchableOpacity
                key={obj.id}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("ObjetivoDetalhe", { id: obj.id })
                }
              >
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <LinearGradient
                      colors={["#3B82F6", "#A855F7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconBox}
                    >
                      {iconeObjetivo(obj.nome)}
                    </LinearGradient>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.cardTitle}>{obj.nome}</Text>
                      <Text style={styles.cardDate}>
                        até{" "}
                        {new Date(obj.dataLimite).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>

                    <Text style={styles.percentText}>{perc}%</Text>
                  </View>

                  <Text style={styles.progressLabel}>Progresso</Text>

                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${perc}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.valuesRow}>
                    <View>
                      <Text style={styles.valueLabel}>Economizado</Text>
                      <Text style={styles.valueMoney}>
                        {formatarMoeda(obj.economizado)}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.valueLabel}>Faltam</Text>
                      <Text style={styles.valueMoney}>
                        {formatarMoeda(Math.max(obj.meta - obj.economizado, 0))}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    height: 120
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
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

  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  cardDate: {
    fontSize: 14,
    color: "#666",
  },

  percentText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
  },

  progressLabel: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },

  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
  },

  valuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  valueLabel: {
    fontSize: 13,
    color: "#777",
  },

  valueMoney: {
    fontSize: 16,
    fontWeight: "700",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
