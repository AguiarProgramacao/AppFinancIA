import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";

interface Props {
  visible: boolean;
  loading: boolean;
  senhaAtual: string;
  novaSenha: string;
  confirmSenha: string;
  onSenhaAtualChange: (text: string) => void;
  onNovaSenhaChange: (text: string) => void;
  onConfirmSenhaChange: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ChangePasswordModal({
  visible,
  loading,
  senhaAtual,
  novaSenha,
  confirmSenha,
  onSenhaAtualChange,
  onNovaSenhaChange,
  onConfirmSenhaChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Alterar senha</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Senha atual"
            placeholderTextColor="#444"
            secureTextEntry
            style={styles.modalInput}
            value={senhaAtual}
            onChangeText={onSenhaAtualChange}
          />
          <TextInput
            placeholder="Nova senha"
            placeholderTextColor="#444"
            secureTextEntry
            style={styles.modalInput}
            value={novaSenha}
            onChangeText={onNovaSenhaChange}
          />
          <TextInput
            placeholder="Confirmar nova senha"
            placeholderTextColor="#444"
            secureTextEntry
            style={styles.modalInput}
            value={confirmSenha}
            onChangeText={onConfirmSenhaChange}
          />
          <TouchableOpacity style={styles.modalButton} onPress={onSubmit}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.modalButtonText}>Salvar</Text>
            )}
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});
