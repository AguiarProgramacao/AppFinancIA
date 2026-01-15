import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

async function getToken() {
  const token = await AsyncStorage.getItem("@token");
  if (!token) throw new Error("Token nao encontrado");
  return token;
}

export interface NotificationPreferences {
  notificacoesPushObjetivos: boolean;
  notificacoesPushTransacoes: boolean;
  notificacoesEmailGerais: boolean;
  notificacoesEmailRelatorio: boolean;
}

export async function getNotificationPreferences() {
  const token = await getToken();
  return apiRequest<NotificationPreferences>(
    "/notifications/preferences",
    "GET",
    undefined,
    token
  );
}

export async function updateNotificationPreferences(
  input: Partial<NotificationPreferences>
) {
  const token = await getToken();
  return apiRequest(
    "/notifications/preferences",
    "PUT",
    input,
    token
  );
}

export async function registrarPushToken(tokenPush: string) {
  const token = await getToken();
  return apiRequest(
    "/notifications/push-token",
    "POST",
    { token: tokenPush },
    token
  );
}
