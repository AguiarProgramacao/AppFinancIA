import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { buscarTransacaoPorId, deletarTransacao } from "../services/transacoes";
import { ArrowLeft, Trash, Pencil } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Route = RouteProp<RootStackParamList, "TransacaoDetalhe">;

export default function TransacaoDetalheScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<any>();
  const { id } = route.params;

  const [transacao, setTransacao] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const data = await buscarTransacaoPorId(id);
      setTransacao(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    await deletarTransacao(id);
    navigation.goBack();
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!transacao) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Transação não encontrada</Text>
      </View>
    );
  }

  const isDespesa = transacao.tipo === "despesa";

  function formatarMoeda(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 26 }} />
      </View>
      <View style={styles.container}>
        
        <View style={styles.card}>
          <Text style={styles.descricao}>
            {transacao.descricao || transacao.categoria.nome}
          </Text>

          <Text
            style={[
              styles.valor,
              { color: isDespesa ? "#EF4444" : "#22C55E" },
            ]}
          >
            {isDespesa ? "-" : "+"} 
            {formatarMoeda(transacao.valor.toFixed(2))}
          </Text>
        </View>

        {/* DETALHES */}
        <View style={styles.section}>
          <Detail label="Categoria" value={transacao.categoria.nome} />
          <Detail
            label="Data"
            value={new Date(transacao.data).toLocaleDateString("pt-BR")}
          />
          {transacao.formaPagamento && (
            <Detail label="Pagamento" value={transacao.formaPagamento} />
          )}
          {transacao.observacoes && (
            <Detail label="Observações" value={transacao.observacoes} />
          )}
        </View>

        {/* AÇÕES */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("NovaTransacao", { id: transacao.id })
            }
          >
            <Pencil size={18} color="#2563EB" />
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash size={18} color="#DC2626" />
            <Text style={styles.deleteText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 20
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    height: 100,
    gap: 16
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 24,
    marginTop: 10,
    elevation: 2,
    alignItems: "center",
  },

  descricao: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },

  valor: {
    fontSize: 32,
    fontWeight: "800",
  },

  section: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
  },

  detailRow: {
    marginBottom: 14,
  },

  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },

  actions: {
    marginTop: 24,
    gap: 12,
  },

  editButton: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "700",
  },
});
