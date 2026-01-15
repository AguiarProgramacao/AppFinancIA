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
  code: string;
  onCodeChange: (text: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TwoFactorModal({
  visible,
  loading,
  code,
  onCodeChange,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirmar codigo</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>
          <TextInput
            placeholder="Codigo de 6 digitos"
            placeholderTextColor="#444"
            keyboardType="numeric"
            style={styles.modalInput}
            value={code}
            onChangeText={onCodeChange}
          />
          <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.modalButtonText}>Confirmar</Text>
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
