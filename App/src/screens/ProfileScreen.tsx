import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Camera, User } from "lucide-react-native";
import { AuthContext } from "../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { getErrorMessage } from "../utils/errors";

export default function ProfileScreen({ navigation }: any) {
  const { user, updateProfile } = useContext(AuthContext);
  const [nome, setNome] = useState(user?.nome ?? "");
  const [remuneracaoCentavos, setRemuneracaoCentavos] = useState(
    user?.remuneracao !== undefined
      ? String(Math.round(user.remuneracao * 100))
      : ""
  );
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(
    user?.fotoPerfil ?? null
  );
  const email = user?.email ?? "";

  async function handleSelecionarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Perfil", "Permissao para acessar fotos negada.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Perfil", "Nao foi possivel carregar a foto.");
      return;
    }

    const dataUri = `data:image/jpeg;base64,${asset.base64}`;
    setFotoPerfil(dataUri);
  }

  async function handleSalvar() {
    const valor = remuneracaoCentavos
      ? Number(remuneracaoCentavos) / 100
      : 0;
    if (Number.isNaN(valor)) {
      Alert.alert("Perfil", "Informe uma remuneracao valida.");
      return;
    }

    try {
      await updateProfile(nome, valor, fotoPerfil);
      Alert.alert("Perfil", "Alteracoes salvas.");
    } catch (err: any) {
      Alert.alert(
        "Perfil",
        getErrorMessage(err, "Nao foi possivel salvar.")
      );
    }
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
            ) : (
              <User size={42} color="#FFF" />
            )}
          </View>
          <TouchableOpacity style={styles.cameraButton} onPress={handleSelecionarFoto}>
            <Camera size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            style={styles.input}
            placeholder="Seu nome"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            value={email}
            editable={false}
            style={[styles.input, styles.inputDisabled]}
            placeholder="email@exemplo.com"
          />
          <Text style={styles.helper}>O e-mail nao pode ser alterado</Text>

          <Text style={styles.label}>Remuneração Atual</Text>
          <TextInput
            value={
              remuneracaoCentavos
                ? formatarMoeda(Number(remuneracaoCentavos) / 100)
                : ""
            }
            onChangeText={(text) =>
              setRemuneracaoCentavos(text.replace(/\D/g, ""))
            }
            style={styles.input}
            placeholder="Valor Fixo Mensal"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Text style={styles.saveText}>Salvar Alterações</Text>
          </TouchableOpacity>
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
  avatarWrap: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 24,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cameraButton: {
    position: "absolute",
    right: "38%",
    bottom: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  inputDisabled: {
    color: "#9CA3AF",
    backgroundColor: "#F9FAFB",
  },
  helper: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
