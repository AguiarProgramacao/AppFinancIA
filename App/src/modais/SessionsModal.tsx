import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { X } from "lucide-react-native";

interface SessionItem {
  id: string;
  userAgent?: string;
  ultimoAcesso?: string;
}

interface Props {
  visible: boolean;
  sessions: SessionItem[];
  currentSessionId: string | null;
  onClose: () => void;
  onRevokeSession: (id: string) => void;
  onRevokeOthers: () => void;
}

export default function SessionsModal({
  visible,
  sessions,
  currentSessionId,
  onClose,
  onRevokeSession,
  onRevokeOthers,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCardLarge}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sessoes ativas</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 320 }}>
            {sessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              return (
                <View key={session.id} style={styles.sessionRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionTitle}>
                      {session.userAgent || "Dispositivo"}
                    </Text>
                    <Text style={styles.sessionSubtitle}>
                      Ultimo acesso:{" "}
                      {session.ultimoAcesso
                        ? new Date(session.ultimoAcesso).toLocaleString()
                        : "-"}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.sessionBadge}>Atual</Text>
                    )}
                  </View>
                  {!isCurrent && (
                    <TouchableOpacity
                      style={styles.sessionButton}
                      onPress={() => onRevokeSession(session.id)}
                    >
                      <Text style={styles.sessionButtonText}>Deslogar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
            {!sessions.length && (
              <Text style={styles.emptyText}>Nenhuma sessao ativa.</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.secondaryButton} onPress={onRevokeOthers}>
            <Text style={styles.secondaryButtonText}>
              Deslogar outros dispositivos
            </Text>
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
  modalCardLarge: {
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
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  sessionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  sessionBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#E0ECFF",
    color: "#2563EB",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sessionButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sessionButtonText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#B45309",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 16,
  },
});
