import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import DonutChart from "../components/DonutChart";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoriaGrafico, listarCategoriasGrafico } from "../services/graficos";

export default function GraficosScreen() {
  const [filter, setFilter] = useState("todos");
  const [categorias, setCategorias] = useState<CategoriaGrafico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, [filter]);

  async function carregar() {
    setLoading(true);
    try {
      const data = await listarCategoriasGrafico(filter);
      setCategorias(data.filter(c => c.valor > 0));
    } catch (e) {
      console.error("Erro gráfico:", e);
    } finally {
      setLoading(false);
    }
  }

  function formatarMoeda(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ backgroundColor: "#FFF", paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={styles.title}>Categorias</Text>

          
          <View style={styles.filterContainer}>
            {["mes", "3meses", "todos"].map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.filterButton, filter === tipo && styles.filterActive]}
                onPress={() => setFilter(tipo)}
              >
                <Text style={[styles.filterText, filter === tipo && styles.filterTextActive]}>
                  {tipo === "mes" && "Mês Atual"}
                  {tipo === "3meses" && "3 Meses"}
                  {tipo === "todos" && "Todos"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Distribuição de Gastos</Text>

            {categorias.length > 0 ? (
              <DonutChart
                data={categorias.map(c => ({
                  value: c.valor,
                  color: c.color,
                }))}
              />
            ) : (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                Nenhum dado para o período selecionado
              </Text>
            )}
          </View>

          
          {categorias.map((c) => (
            <View style={styles.categoryCard} key={c.id}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={[styles.dot, { backgroundColor: c.color }]} />
                <Text style={styles.categoryLabel}>{c.label}</Text>
              </View>

              <View>
                <Text style={styles.categoryValue}>{formatarMoeda(c.valor)}</Text>
                <Text style={styles.categoryPercent}>{c.percentual}%</Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${c.percentual}%`, backgroundColor: c.color },
                  ]}
                />
              </View>
            </View>
          ))}
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

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 16,
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EEE",
    padding: 6,
    borderRadius: 14,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  filterActive: {
    backgroundColor: "#FFF",
  },

  filterText: {
    color: "#444",
    fontSize: 14,
  },

  filterTextActive: {
    color: "#000",
    fontWeight: "700",
  },

  chartCard: {
    backgroundColor: "#FFF",
    marginTop: 18,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  categoryCard: {
    backgroundColor: "#FFF",
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  categoryLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  categoryValue: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },

  categoryPercent: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },

  progressBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 10,
  },

  progressFill: {
    height: 6,
    borderRadius: 6,
  },
});
