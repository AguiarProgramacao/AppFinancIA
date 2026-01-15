import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";

interface Props {
  visible: boolean;
  loading: boolean;
  resetTokenId: string | null;
  resetEmail: string;
  resetCode: string;
  resetSenha: string;
  resetConfirm: string;
  onResetEmailChange: (text: string) => void;
  onResetCodeChange: (text: string) => void;
  onResetSenhaChange: (text: string) => void;
  onResetConfirmChange: (text: string) => void;
  onRequestReset: () => void;
  onResetPassword: () => void;
  onClose: () => void;
}

export default function ResetPasswordModal({
  visible,
  loading,
  resetTokenId,
  resetEmail,
  resetCode,
  resetSenha,
  resetConfirm,
  onResetEmailChange,
  onResetCodeChange,
  onResetSenhaChange,
  onResetConfirmChange,
  onRequestReset,
  onResetPassword,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Redefinir senha</Text>

          {!resetTokenId ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Seu Email"
                placeholderTextColor="#444"
                autoCapitalize="none"
                value={resetEmail}
                onChangeText={onResetEmailChange}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onRequestReset}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Enviar codigo</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Codigo de 6 digitos"
                placeholderTextColor="#444"
                keyboardType="numeric"
                value={resetCode}
                onChangeText={onResetCodeChange}
              />
              <TextInput
                style={styles.input}
                placeholder="Nova senha"
                placeholderTextColor="#444"
                secureTextEntry
                value={resetSenha}
                onChangeText={onResetSenhaChange}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#444"
                secureTextEntry
                value={resetConfirm}
                onChangeText={onResetConfirmChange}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onResetPassword}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
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
  modalButton: {
    backgroundColor: "#3D7DFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  modalCancel: {
    marginTop: 12,
    textAlign: "center",
    color: "#6B7280",
  },
});
