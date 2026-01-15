import React, { useContext, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { requestPasswordReset, resetPassword } from "../services/auth";
import { getErrorMessage } from "../utils/errors";
import ResetPasswordModal from "../modais/ResetPasswordModal";

export default function LoginScreen() {
  const { signIn, verifyTwoFactor } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [twoFactorTokenId, setTwoFactorTokenId] = useState<string | null>(
    null
  );
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetTokenId, setResetTokenId] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState("");
  const [resetSenha, setResetSenha] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");

  type Nav = NativeStackNavigationProp<RootStackParamList, "Login">;
  const navigation = useNavigation<Nav>();

  async function handleLogin() {
    try {
      setLoading(true);
      const result = await signIn(email, senha);
      if (result?.requiresTwoFactor) {
        setTwoFactorTokenId(result.twoFactorTokenId || null);
        setTwoFactorEmail(result.email || "");
      }
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel entrar."));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyTwoFactor() {
    if (!twoFactorTokenId) return;
    try {
      setLoading(true);
      await verifyTwoFactor(twoFactorTokenId, twoFactorCode);
      setTwoFactorCode("");
      setTwoFactorTokenId(null);
      setTwoFactorEmail("");
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Codigo invalido."));
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestReset() {
    if (!resetEmail) {
      Alert.alert("Erro", "Informe o e-mail.");
      return;
    }
    try {
      setLoading(true);
      const result = await requestPasswordReset(resetEmail);
      if (!result?.tokenId) {
        Alert.alert(
          "Redefinicao",
          "Se o e-mail existir, enviamos um codigo."
        );
        return;
      }
      setResetTokenId(result.tokenId);
      Alert.alert(
        "Redefinicao",
        `Enviamos um codigo para ${result.email || "seu email"}.`
      );
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel enviar."));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!resetTokenId) return;
    if (!resetCode || !resetSenha) {
      Alert.alert("Erro", "Preencha codigo e nova senha.");
      return;
    }
    if (resetSenha !== resetConfirm) {
      Alert.alert("Erro", "As senhas nao conferem.");
      return;
    }
    try {
      setLoading(true);
      await resetPassword(resetTokenId, resetCode, resetSenha);
      Alert.alert("Senha atualizada", "Entre com a nova senha.");
      setResetModalVisible(false);
      setResetTokenId(null);
      setResetCode("");
      setResetSenha("");
      setResetConfirm("");
    } catch (err: any) {
      Alert.alert(
        "Erro",
        getErrorMessage(err, "Nao foi possivel redefinir.")
      );
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

      <Text style={styles.subtitle}>
        O app que vai te ajudar a ter um controle maior sobre sua gestao
        financeira.
      </Text>

      <Text style={styles.title}>
        {twoFactorTokenId ? "Confirmar codigo" : "Login"}
      </Text>

      {!twoFactorTokenId && (
        <TextInput
          style={styles.input}
          placeholder="Seu Email"
          placeholderTextColor="#444"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      )}

      {!twoFactorTokenId && (
        <TextInput
          style={styles.input}
          placeholder="Sua Senha"
          placeholderTextColor="#444"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      )}

      {twoFactorTokenId && (
        <>
          <Text style={styles.twoFactorHint}>
            Enviamos um codigo para {twoFactorEmail || "seu email"}.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Codigo de 6 digitos"
            keyboardType="numeric"
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
          />
        </>
      )}

      <TouchableOpacity
        style={{ width: "100%" }}
        onPress={twoFactorTokenId ? handleVerifyTwoFactor : handleLogin}
      >
        <LinearGradient
          colors={["#45C58C", "#3D7DFF"]}
          style={styles.buttonPrimary}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonPrimaryText}>
              {twoFactorTokenId ? "Confirmar" : "Acessar"}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {!twoFactorTokenId && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text>Ainda nao tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={{ color: "#3D7DFF", fontWeight: "600" }}>
              Clique aqui
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!twoFactorTokenId && (
        <TouchableOpacity onPress={() => setResetModalVisible(true)}>
          <Text style={styles.forgotText}>Esqueci a senha</Text>
        </TouchableOpacity>
      )}

      <ResetPasswordModal
        visible={resetModalVisible}
        loading={loading}
        resetTokenId={resetTokenId}
        resetEmail={resetEmail}
        resetCode={resetCode}
        resetSenha={resetSenha}
        resetConfirm={resetConfirm}
        onResetEmailChange={setResetEmail}
        onResetCodeChange={setResetCode}
        onResetSenhaChange={setResetSenha}
        onResetConfirmChange={setResetConfirm}
        onRequestReset={handleRequestReset}
        onResetPassword={handleResetPassword}
        onClose={() => {
          setResetModalVisible(false);
          setResetTokenId(null);
          setResetCode("");
          setResetSenha("");
          setResetConfirm("");
        }}
      />

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
    fontWeight: "600",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
  },

  twoFactorHint: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
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
  forgotText: {
    marginTop: 10,
    color: "#3D7DFF",
    fontWeight: "600",
  },
});
