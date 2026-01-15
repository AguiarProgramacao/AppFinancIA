import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Lock,
  ShieldCheck,
  Fingerprint,
  Key,
  ChevronRight,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import {
  changePassword,
  confirmTwoFactor,
  disableTwoFactor,
  getSecurityStatus,
  listSessions,
  requestTwoFactor,
  revokeOtherSessions,
  revokeSession,
} from "../services/security";
import { getErrorMessage } from "../utils/errors";
import ChangePasswordModal from "../modais/ChangePasswordModal";
import TwoFactorModal from "../modais/TwoFactorModal";
import DisableTwoFactorModal from "../modais/DisableTwoFactorModal";
import SessionsModal from "../modais/SessionsModal";

export default function SecurityScreen({ navigation }: any) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorTokenId, setTwoFactorTokenId] = useState<string | null>(
    null
  );
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [disableTwoFactorVisible, setDisableTwoFactorVisible] =
    useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const [biometria, setBiometria] = useState(false);

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");

  const [sessionsVisible, setSessionsVisible] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSecurity();
  }, []);

  async function loadSecurity() {
    try {
      const status = await getSecurityStatus();
      setTwoFactorEnabled(!!status.twoFactorEnabled);
      const biometriaStorage = await AsyncStorage.getItem(
        "@biometriaEnabled"
      );
      setBiometria(biometriaStorage === "true");
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel carregar."));
    }
  }

  async function handleToggleTwoFactor() {
    if (twoFactorEnabled) {
      setDisableTwoFactorVisible(true);
      return;
    }

    try {
      setLoading(true);
      const result = await requestTwoFactor();
      setTwoFactorTokenId(result.tokenId);
      setTwoFactorModalVisible(true);
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel ativar."));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmTwoFactor() {
    if (!twoFactorTokenId) return;
    try {
      setLoading(true);
      await confirmTwoFactor(twoFactorTokenId, twoFactorCode);
      setTwoFactorEnabled(true);
      setTwoFactorCode("");
      setTwoFactorTokenId(null);
      setTwoFactorModalVisible(false);
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Codigo invalido."));
    } finally {
      setLoading(false);
    }
  }

  async function handleDisableTwoFactor() {
    try {
      setLoading(true);
      await disableTwoFactor(disablePassword);
      setTwoFactorEnabled(false);
      setDisablePassword("");
      setDisableTwoFactorVisible(false);
    } catch (err: any) {
      Alert.alert(
        "Erro",
        getErrorMessage(err, "Nao foi possivel desativar.")
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBiometria(value: boolean) {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert("Biometria", "Dispositivo sem suporte.");
        return;
      }
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Biometria", "Nenhuma biometria cadastrada.");
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmar biometria",
      });
      if (!result.success) {
        return;
      }
    }

    setBiometria(value);
    await AsyncStorage.setItem("@biometriaEnabled", value ? "true" : "false");
  }

  async function handleChangePassword() {
    if (!senhaAtual || !novaSenha) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    if (novaSenha !== confirmSenha) {
      Alert.alert("Erro", "As senhas nao conferem");
      return;
    }
    try {
      setLoading(true);
      await changePassword(senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmSenha("");
      setChangePasswordVisible(false);
      Alert.alert("Senha alterada", "Sua senha foi atualizada.");
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel alterar."));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenSessions() {
    try {
      setSessionsLoading(true);
      const result = await listSessions();
      setCurrentSessionId(result.currentSessionId || null);
      setSessions(result.sessions || []);
      setSessionsVisible(true);
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel carregar."));
    } finally {
      setSessionsLoading(false);
    }
  }

  async function handleRevokeSession(id: string) {
    try {
      await revokeSession(id);
      setSessions((prev) => prev.filter((session) => session.id !== id));
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel deslogar."));
    }
  }

  async function handleRevokeOthers() {
    try {
      await revokeOtherSessions();
      setSessions((prev) =>
        prev.filter((session) => session.id === currentSessionId)
      );
    } catch (err: any) {
      Alert.alert("Erro", getErrorMessage(err, "Nao foi possivel deslogar."));
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguranca</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => setChangePasswordVisible(true)}
          >
            <View style={[styles.iconWrap, { backgroundColor: "#E0ECFF" }]}>
              <Lock size={20} color="#3B82F6" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Alterar Senha</Text>
              <Text style={styles.cardSubtitle}>Atualize sua senha da conta</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#ECFDF5" }]}>
              <ShieldCheck size={20} color="#22C55E" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Autenticação em Duas Etapas</Text>
              <Text style={styles.cardSubtitle}>
                Código enviado por email
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleToggleTwoFactor}
                trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
                thumbColor={twoFactorEnabled ? "#3B82F6" : "#FFF"}
              />
            )}
          </View>

          <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: "#F5F3FF" }]}>
              <Fingerprint size={20} color="#8B5CF6" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Biometria</Text>
              <Text style={styles.cardSubtitle}>
                Use digital ou Face ID para entrar
              </Text>
            </View>
            <Switch
              value={biometria}
              onValueChange={handleToggleBiometria}
              trackColor={{ false: "#E5E7EB", true: "#C4B5FD" }}
              thumbColor={biometria ? "#8B5CF6" : "#FFF"}
            />
          </View>

          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={handleOpenSessions}
          >
            <View style={[styles.iconWrap, { backgroundColor: "#FFF7ED" }]}>
              <Key size={20} color="#F97316" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Sessões Ativas</Text>
              <Text style={styles.cardSubtitle}>
                Gerencie seus dispositivos conectados
              </Text>
            </View>
            {sessionsLoading ? (
              <ActivityIndicator />
            ) : (
              <ChevronRight size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ChangePasswordModal
        visible={changePasswordVisible}
        loading={loading}
        senhaAtual={senhaAtual}
        novaSenha={novaSenha}
        confirmSenha={confirmSenha}
        onSenhaAtualChange={setSenhaAtual}
        onNovaSenhaChange={setNovaSenha}
        onConfirmSenhaChange={setConfirmSenha}
        onClose={() => setChangePasswordVisible(false)}
        onSubmit={handleChangePassword}
      />


      <TwoFactorModal
        visible={twoFactorModalVisible}
        loading={loading}
        code={twoFactorCode}
        onCodeChange={setTwoFactorCode}
        onClose={() => setTwoFactorModalVisible(false)}
        onConfirm={handleConfirmTwoFactor}
      />


      <DisableTwoFactorModal
        visible={disableTwoFactorVisible}
        loading={loading}
        password={disablePassword}
        onPasswordChange={setDisablePassword}
        onClose={() => setDisableTwoFactorVisible(false)}
        onConfirm={handleDisableTwoFactor}
      />


      <SessionsModal
        visible={sessionsVisible}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onClose={() => setSessionsVisible(false)}
        onRevokeSession={handleRevokeSession}
        onRevokeOthers={handleRevokeOthers}
      />

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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
});
