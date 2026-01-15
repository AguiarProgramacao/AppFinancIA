import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Categoria } from "../../services/categorias";

interface Props {
  visible: boolean;
  categorias: Categoria[];
  categoriaSelecionada: string;
  novaCategoria: string;
  onNovaCategoriaChange: (text: string) => void;
  coresCategorias: string[];
  corSelecionada: string;
  onSelecionarCor: (cor: string) => void;
  onSelecionar: (categoria: Categoria) => void;
  onCriarCategoria: () => void;
  onFechar: () => void;
}

export default function ModalCategorias({
  visible,
  categorias,
  categoriaSelecionada,
  novaCategoria,
  onNovaCategoriaChange,
  coresCategorias,
  corSelecionada,
  onSelecionarCor,
  onSelecionar,
  onCriarCategoria,
  onFechar,
}: Props) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Categorias</Text>

        <ScrollView>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoriaItem}
              onPress={() => onSelecionar(cat)}
            >
              <View
                style={[
                  styles.categoriaDot,
                  { backgroundColor: cat.cor },
                ]}
              />
              <Text
                style={[
                  styles.categoriaText,
                  categoriaSelecionada === cat.nome && styles.categoriaTextActive,
                ]}
              >
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.criarCategoria} onPress={onCriarCategoria}>
            <Text style={styles.criarCategoriaText}>+ Criar categoria</Text>
          </TouchableOpacity>

          <TextInput
            placeholder="Nome da categoria"
            placeholderTextColor="#444"
            value={novaCategoria}
            onChangeText={onNovaCategoriaChange}
            style={styles.input}
          />

          <Text style={styles.label}>Cor da categoria</Text>
          <View style={styles.colorRow}>
            {coresCategorias.map((cor) => (
              <TouchableOpacity
                key={cor}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: cor },
                  corSelecionada === cor && styles.colorSwatchActive,
                ]}
                onPress={() => onSelecionarCor(cor)}
              />
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity onPress={onFechar}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 30,
  },
  categoriaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  categoriaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoriaText: {
    fontSize: 16,
  },
  categoriaTextActive: {
    fontWeight: "700",
  },
  criarCategoria: {
    marginTop: 10,
    paddingVertical: 12,
  },
  criarCategoriaText: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#F5F6FA",
    borderWidth: 1,
    borderColor: "#DDD",
    boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchActive: {
    borderColor: "#111827",
  },
  cancelText: {
    textAlign: "center",
    marginTop: 10,
  },
});
