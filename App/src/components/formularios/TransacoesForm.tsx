import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Calendar, ChevronDown, ArrowLeft } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { atualizarTransacao, buscarTransacaoPorId, criarTransacao } from "../../services/transacoes";
import { listarCategorias, criarCategoria, Categoria } from "../../services/categorias";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import ModalCategorias from "./ModalCategorias";

type Route = RouteProp<RootStackParamList, "NovaTransacao">;

export default function NovaTransacaoScreen({ navigation }: any) {
  const route = useRoute<Route>();
  const transacaoId = route.params?.id;
  const tipoInicial = route.params?.tipo ?? "despesa";
  const isEdit = Boolean(transacaoId);

  const [tipo, setTipo] = useState<"despesa" | "receita">(tipoInicial);
  const [valor, setValor] = useState("");
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [corCategoria, setCorCategoria] = useState("#83e948");

  const [novaCategoria, setNovaCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pagamento, setPagamento] = useState("PIX");
  const [observacoes, setObservacoes] = useState("");

  const [data, setData] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const coresCategorias = ["#83e948", "#22c55e", "#3b82f6", "#8b5cf6", "#ef4444", "#0ea5e9", "#f97316", "#14b8a6"];

  const formasPagamento = ["PIX", "Cartão Débito", "Cartão Crédito", "Dinheiro", "Transferência"];

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function handleSalvar() {
    if (!valor || !categoria) return;

    const payload = {
      tipo,
      valor: Number(valor),
      descricao,
      data: data.toISOString(),
      formaPagamento: pagamento,
      observacoes,
      categoriaId: categorias.find(c => c.nome === categoria)!.id,
    };

    try {
      if (isEdit) {
        await atualizarTransacao(transacaoId!, payload);
      } else {
        await criarTransacao(payload);
      }

      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  }

  async function carregarCategorias() {
    try {
      const data = await listarCategorias();
      setCategorias(data);
    } catch (err) {
      console.error("Erro ao carregar categorias", err);
    }
  }

  async function handleCriarCategoria() {
    if (!novaCategoria.trim()) return;

    const nova = await criarCategoria({
      nome: novaCategoria,
      tipo,
      cor: corCategoria,
    });

    setCategorias((prev) => [...prev, nova]);
    setCategoria(nova.nome);
    setNovaCategoria("");
    setCorCategoria("#83e948");
    setModalCategoria(false);
  }

  useEffect(() => {
    if (isEdit) {
      carregarTransacao();
    }
  }, [isEdit]);

  async function carregarTransacao() {
    const data = await buscarTransacaoPorId(transacaoId!);

    setTipo(data.tipo);
    setValor(String(data.valor));
    setDescricao(data.descricao || "");
    setCategoria(data.categoria.nome);
    setPagamento(data.formaPagamento || "PIX");
    setObservacoes(data.observacoes || "");
    setData(new Date(data.data));
  }

  function formatarMoeda(valor: number) {
    return (valor / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleValorChange(text: string) {
    const apenasNumeros = text.replace(/\D/g, "");
    setValor(apenasNumeros);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={{ backgroundColor: "#FFF", paddingHorizontal: 20 }}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={26} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Nova Transação</Text>
          </View>

          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[styles.tipoButton, tipo === "despesa" && styles.tipoAtivo]}
              onPress={() => setTipo("despesa")}
            >
              <Text style={[styles.tipoText, tipo === "despesa" && styles.tipoTextAtivo]}>
                Despesa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tipoButton, tipo === "receita" && styles.tipoAtivo]}
              onPress={() => setTipo("receita")}
            >
              <Text style={[styles.tipoText, tipo === "receita" && styles.tipoTextAtivo]}>
                Receita
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>

          <Text style={styles.label}>Valor *</Text>
          <View style={styles.valorBox}>
            <TextInput
              placeholder="R$ 0,00"
              placeholderTextColor="#444"
              keyboardType="numeric"
              value={valor ? formatarMoeda(Number(valor)) : ""}
              onChangeText={handleValorChange}
              style={styles.valorInput}
            />
          </View>


          <Text style={styles.label}>Categoria *</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={async () => {
              await carregarCategorias();
              setModalCategoria(true);
            }}
          >
            <Text style={{ color: categoria ? "#000" : "#999" }}>
              {categoria || "Selecione uma categoria"}
            </Text>
            <ChevronDown size={20} color="#888" />
          </TouchableOpacity>


          <Text style={styles.label}>Descrição</Text>
          <TextInput
            placeholder="Ex: Almoço no restaurante"
            placeholderTextColor="#444"
            value={descricao}
            onChangeText={setDescricao}
            style={styles.input}
          />


          <Text style={styles.label}>Data *</Text>

          <TouchableOpacity
            style={styles.select}
            onPress={() => setMostrarCalendario(true)}
          >
            <Text>{data.toLocaleDateString("pt-BR")}</Text>
            <Calendar size={20} color="#888" />
          </TouchableOpacity>

          {mostrarCalendario && (
            <DateTimePicker
              value={data}
              mode="date"
              onChange={(event: any, selectedDate?: Date) => {
                setMostrarCalendario(false);
                if (selectedDate) setData(selectedDate);
              }}
            />
          )}


          <Text style={styles.label}>Forma de Pagamento</Text>

          <TouchableOpacity
            style={styles.select}
            onPress={() => setModalPagamento(true)}
          >
            <Text>{pagamento}</Text>
            <ChevronDown size={20} color="#888" />
          </TouchableOpacity>


          <Text style={styles.label}>Observações</Text>
          <TextInput
            placeholder="Adicione observações (opcional)"
            placeholderTextColor="#444"
            multiline
            numberOfLines={4}
            value={observacoes}
            onChangeText={setObservacoes}
            style={styles.textarea}
          />


          <TouchableOpacity style={styles.button} onPress={handleSalvar}>
            <Text style={styles.buttonText}>
              {isEdit ? "Salvar Alterações" : "Salvar Transação"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ModalCategorias
        visible={modalCategoria}
        categorias={categorias}
        categoriaSelecionada={categoria}
        novaCategoria={novaCategoria}
        onNovaCategoriaChange={setNovaCategoria}
        coresCategorias={coresCategorias}
        corSelecionada={corCategoria}
        onSelecionarCor={setCorCategoria}
        onSelecionar={(cat) => {
          setCategoria(cat.nome);
          setModalCategoria(false);
        }}
        onCriarCategoria={handleCriarCategoria}
        onFechar={() => setModalCategoria(false)}
      />
      {modalPagamento && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Forma de pagamento</Text>

            <ScrollView>
              {formasPagamento.map((forma) => (
                <TouchableOpacity
                  key={forma}
                  style={styles.categoriaItem}
                  onPress={() => {
                    setPagamento(forma);
                    setModalPagamento(false);
                  }}
                >
                  <Text style={styles.categoriaText}>{forma}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setModalPagamento(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    gap: 16,
    marginTop: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  tipoContainer: {
    flexDirection: "row",
    backgroundColor: "#EEE",
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 5,
    paddingVertical: 5
  },

  tipoButton: {
    flex: 1,
    paddingVertical: 5,
    alignItems: "center",
    borderRadius: 12,
  },

  tipoAtivo: {
    backgroundColor: "#FFF",
  },

  tipoText: {
    fontSize: 16,
    color: "#555",
  },

  tipoTextAtivo: {
    color: "#000",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },

  valorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#DDD",
    boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)"
  },

  rs: {
    fontSize: 22,
    fontWeight: "700",
    marginRight: 12,
    color: "#AAA"
  },

  valorInput: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    color: "#222"
  },

  select: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#DDD",
    boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)"
  },

  input: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#DDD",
    boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)"
  },

  textarea: {
    padding: 14,
    borderRadius: 12,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 30,
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#DDD",
  },

  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 12,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-start",
    zIndex: 999,
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 30
  },

  categoriaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  categoriaText: {
    fontSize: 16,
  },
});
