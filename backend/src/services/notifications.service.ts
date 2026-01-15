import { prisma } from "../prisma/client";
import { AppError } from "../utils/appError";

export interface NotificationPreferencesInput {
  notificacoesPushObjetivos?: boolean;
  notificacoesPushTransacoes?: boolean;
  notificacoesEmailGerais?: boolean;
  notificacoesEmailRelatorio?: boolean;
}

export async function getNotificationPreferences(userId: string) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      notificacoesPushObjetivos: true,
      notificacoesPushTransacoes: true,
      notificacoesEmailGerais: true,
      notificacoesEmailRelatorio: true,
    },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "Usuario nao encontrado.", 404);
  }

  return user;
}

export async function updateNotificationPreferences(
  userId: string,
  input: NotificationPreferencesInput
) {
  await prisma.usuario.update({
    where: { id: userId },
    data: {
      notificacoesPushObjetivos: input.notificacoesPushObjetivos,
      notificacoesPushTransacoes: input.notificacoesPushTransacoes,
      notificacoesEmailGerais: input.notificacoesEmailGerais,
      notificacoesEmailRelatorio: input.notificacoesEmailRelatorio,
    },
  });
}

export async function atualizarPushToken(userId: string, token: string) {
  await prisma.usuario.update({
    where: { id: userId },
    data: {
      expoPushToken: token,
    },
  });
}
