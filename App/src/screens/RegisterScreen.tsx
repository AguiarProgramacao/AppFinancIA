import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { apiRequest } from "../services/api";
import { getErrorMessage } from "../utils/errors";

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !senha) {
      return Alert.alert("Erro", "Preencha todos os campos");
    }

    try {
      setLoading(true);
      await apiRequest("/auth/register", "POST", { nome, email, senha });
      Alert.alert("Sucesso", "Cadastro realizado com sucesso");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel cadastrar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Registro</Text>

      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        placeholderTextColor="#444"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Seu Email"
        placeholderTextColor="#444"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Sua Senha"
        placeholderTextColor="#444"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonPrimaryText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={18} color="#444" />
        <Text style={styles.backText}>Voltar para o login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
  },

  logo: {
    width: 170,
    height: 170,
    resizeMode: "contain",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    color: "#444",
    width: "90%",
    marginBottom: 22,
    fontSize: 17,
    fontWeight: 600
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
  },

  input: {
    width: "100%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  buttonPrimary: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 10,
  },

  buttonPrimaryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  backText: {
    marginLeft: 6,
    color: "#222",
    fontSize: 14,
  },
});
