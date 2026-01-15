import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import {
  User,
  ChevronRight,
  Bell,
  ShieldCheck,
  Download,
  LogOut,
  Info,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";

export default function ConfigScreen() {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  function handleProfile() {
    navigation.navigate("Profile");
  }

  function handleSecurity() {
    navigation.navigate("Security");
  }

  function handleNotifications() {
    navigation.navigate("Notifications");
  }

  function handleExportData() {
    navigation.navigate("ExportData");
  }

  function handleAbout() {
    navigation.navigate("About");
  }

  function handleLogout() {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: signOut,
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFF" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Configuracoes</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={styles.userCard}
            onPress={handleProfile}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              {user?.fotoPerfil ? (
                <Image source={{ uri: user.fotoPerfil }} style={styles.avatarImage} />
              ) : (
                <User size={28} color="#FFF" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.nome}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>CONTA</Text>

          <TouchableOpacity style={styles.item} onPress={handleProfile}>
            <View style={styles.itemLeft}>
              <User size={20} color="#3B82F6" />
              <Text style={styles.itemText}>Perfil</Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleSecurity}>
            <View style={styles.itemLeft}>
              <ShieldCheck size={20} color="#3B82F6" />
              <Text style={styles.itemText}>Segurança</Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>PREFERENCIAS</Text>

          <TouchableOpacity style={styles.item} onPress={handleNotifications}>
            <View style={styles.itemLeft}>
              <Bell size={20} color="#3B82F6" />
              <Text style={styles.itemText}>Notificações</Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleExportData}>
            <View style={styles.itemLeft}>
              <Download size={20} color="#3B82F6" />
              <Text style={styles.itemText}>Exportar Dados</Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>SOBRE</Text>

          <TouchableOpacity style={styles.item} onPress={handleAbout}>
            <View style={styles.itemLeft}>
              <Info size={20} color="#3B82F6" />
              <Text style={styles.itemText}>Sobre o App</Text>
            </View>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logOut} onPress={handleLogout}>
            <LogOut size={17} color="red" />
            <Text style={styles.logOutText}>Sair da Conta</Text>
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
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    height: 90,
    marginBottom: 20,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#2563EB",
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
  },
  userName: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  userEmail: {
    color: "#E0E7FF",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
    marginTop: 10,
  },
  item: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  logOut: {
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 15,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
  },
  logOutText: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
  },
});
