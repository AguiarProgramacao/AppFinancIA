import React, { createContext, useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../services/api";
import { onUnauthorized } from "../utils/authEvents";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { registrarPushToken } from "../services/notifications";

interface User {
  id: string;
  nome: string;
  email: string;
  remuneracao: number;
  fotoPerfil?: string | null;
}

interface SignInResult {
  requiresTwoFactor?: boolean;
  twoFactorTokenId?: string;
  email?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn(email: string, senha: string): Promise<SignInResult | void>;
  verifyTwoFactor(tokenId: string, code: string): Promise<void>;
  updateProfile(
    nome: string,
    remuneracao: number,
    fotoPerfil?: string | null
  ): Promise<void>;
  signOut(): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      forceSignOut();
    });
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    registerForPushNotifications();
  }, [token]);

  async function loadUser() {
    try {
      const userStorage = await AsyncStorage.getItem("@user");
      const tokenStorage = await AsyncStorage.getItem("@token");

      if (userStorage && tokenStorage) {
        setUser(JSON.parse(userStorage));
        setToken(tokenStorage);
      }
    } finally {
      setLoading(false);
    }
  }

  function getDeviceLabel() {
    const constants: any = (Platform as any).constants || {};
    const model = constants.Model || constants.model || constants.deviceName;
    const brand = constants.Brand || constants.brand;
    const osLabel = `${Platform.OS} ${Platform.Version}`;
    const deviceLabel = [brand, model].filter(Boolean).join(" ");
    return deviceLabel ? `${deviceLabel} (${osLabel})` : osLabel;
  }

  async function signIn(email: string, senha: string) {
    const result = await apiRequest("/auth/login", "POST", {
      email,
      senha,
      deviceName: getDeviceLabel(),
    });

    if (result.requiresTwoFactor) {
      return {
        requiresTwoFactor: true,
        twoFactorTokenId: result.twoFactorTokenId,
        email: result.email,
      };
    }

    await AsyncStorage.setItem("@token", result.token);
    await AsyncStorage.setItem("@user", JSON.stringify(result.user));

    setUser(result.user);
    setToken(result.token);

    await registerForPushNotifications(true);
  }

  async function verifyTwoFactor(tokenId: string, code: string) {
    const result = await apiRequest("/auth/verify-2fa", "POST", {
      tokenId,
      code,
      deviceName: getDeviceLabel(),
    });

    await AsyncStorage.setItem("@token", result.token);
    await AsyncStorage.setItem("@user", JSON.stringify(result.user));

    setUser(result.user);
    setToken(result.token);

    await registerForPushNotifications(true);
  }

  async function updateProfile(
    nome: string,
    remuneracao: number,
    fotoPerfil?: string | null
  ) {
    const tokenStorage = await AsyncStorage.getItem("@token");
    if (!tokenStorage) throw new Error("Token nao encontrado");

    const result = await apiRequest("/profile", "PUT", {
      nome,
      remuneracao,
      fotoPerfil,
    }, tokenStorage);

    await AsyncStorage.setItem("@user", JSON.stringify(result));
    setUser(result);
  }

  async function registerForPushNotifications(force = false) {
    try {
      const saved = await AsyncStorage.getItem("@pushToken");

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;
      const expoToken = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();
      const tokenValue = expoToken.data;

      if (force || saved !== tokenValue) {
        await registrarPushToken(tokenValue);
      }
      await AsyncStorage.setItem("@pushToken", tokenValue);
    } catch (err) {
      console.warn("Nao foi possivel registrar push token:", err);
    }
  }

  async function signOut() {
    const tokenStorage = await AsyncStorage.getItem("@token");
    if (tokenStorage) {
      try {
        await apiRequest("/auth/logout", "POST", undefined, tokenStorage);
      } catch {
        // Best effort only
      }
    }
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
  }

  async function forceSignOut() {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        verifyTwoFactor,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
