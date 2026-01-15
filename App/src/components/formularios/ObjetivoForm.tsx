import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Calendar, ChevronDown, ArrowLeft } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import {
  atualizarObjetivo,
  buscarObjetivoPorId,
  criarObjetivo,
} from "../../services/objetivos";
import { getErrorMessage } from "../../utils/errors";

type Nav = NativeStackNavigationProp<
  RootStackParamList,
  "ObjetivoForm"
>;

type Route = RouteProp<RootStackParamList, "ObjetivoForm">;

interface Props {
  navigation: Nav;
}

export default function ObjetivoForm({ navigation }: Props) {
  const route = useRoute<Route>();
  const objetivoId = route.params?.id;

  const [objetivo, setObjetivo] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modalCategoria, setModalCategoria] = useState(false);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const categorias = ["Viagem", "Estudos", "Emergência", "Saúde", "Veículo"];

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!objetivoId) {
        return;
      }

      try {
        const data = await buscarObjetivoPorId(objetivoId);
        if (!ativo) return;
        setObjetivo(data.nome || "");
        setValorAlvo(String(Math.round((data.meta || 0) * 100)));
        setValorAtual(String(Math.round((data.economizado || 0) * 100)));
        setData(new Date(data.dataLimite));
      } catch (err: any) {
        Alert.alert(
          "Erro",
          getErrorMessage(err, "Nao foi possivel carregar o objetivo.")
        );
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [objetivoId]);

  async function handleSalvar() {
    if (!objetivo || !valorAlvo || (!categoria && !objetivoId)) {
      Alert.alert("Erro", "Preencha todos os campos obrigatorios.");
      return;
    }

    const payload = {
      nome: objetivo,
      meta: Number(valorAlvo || "0") / 100,
      economizado: Number(valorAtual || "0") / 100 || 0,
      dataLimite: data.toISOString(),
    };

    try {
      setSaving(true);
      if (objetivoId) {
        await atualizarObjetivo(objetivoId, payload);
      } else {
        await criarObjetivo(payload);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Erro",
        getErrorMessage(err, "Nao foi possivel salvar o objetivo.")
      );
    } finally {
      setSaving(false);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={26} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>
            {objetivoId ? "Editar Objetivo" : "Novo Objetivo"}
          </Text>
        </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
        >

          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={styles.label}>Nome do Objetivo</Text>
            <TextInput
              placeholder="Ex: Viagem para Europa"
              placeholderTextColor="#444"
              value={objetivo}
              onChangeText={setObjetivo}
              style={styles.input}
            />

            <Text style={styles.label}>Categoria *</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => setModalCategoria(true)}
            >
              <Text style={{ color: categoria ? "#000" : "#999" }}>
                {categoria || "Selecione uma categoria"}
              </Text>
              <ChevronDown size={20} color="#888" />
            </TouchableOpacity>

            <Text style={styles.label}>Valor Alvo</Text>
            <View style={styles.valorBox}>
              <TextInput
                placeholder="0,00"
                keyboardType="numeric"
                value={formatarMoeda(Number(valorAlvo || "0"))}
                onChangeText={(text) => setValorAlvo(text.replace(/\D/g, ""))}
                style={styles.valorInput}
              />
            </View>

            <Text style={styles.label}>Valor Atual</Text>
            <View style={styles.valorBox}>
              <TextInput
                placeholder="0,00"
                keyboardType="numeric"
                value={formatarMoeda(Number(valorAtual || "0"))}
                onChangeText={(text) => setValorAtual(text.replace(/\D/g, ""))}
                style={styles.valorInput}
              />
            </View>

            <Text style={styles.label}>Data Limite</Text>
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
                onChange={(e, d) => {
                  setMostrarCalendario(false);
                  if (d) setData(d);
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleSalvar}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {objetivoId ? "Salvar Alterações" : "Criar Objetivo"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        transparent
        animationType="fade"
        visible={modalCategoria}
        onRequestClose={() => setModalCategoria(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalCategoria(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Selecione uma categoria</Text>

            <ScrollView>
              {categorias.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={styles.item}
                  onPress={() => {
                    setCategoria(cat);
                    setModalCategoria(false);
                  }}
                >
                  <Text style={styles.itemText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
    backgroundColor: "#FFF",
    paddingHorizontal: 20
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

  rs: {
    fontSize: 20,
    fontWeight: "700",
    marginRight: 12,
    color: "#AAA"
  },

  valorBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#DDD",
    boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)"
  },

  valorInput: {
    fontSize: 20,
    fontWeight: "700",
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
    marginBottom: 50,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    maxHeight: "70%",
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },

  createButton: {
    paddingVertical: 16,
    alignItems: "center",
  },

  createText: {
    color: "#3B82F6",
    fontWeight: "700",
  },
});
