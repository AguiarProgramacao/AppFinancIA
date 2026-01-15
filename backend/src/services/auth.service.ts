import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { createTwoFactorToken, verifyTwoFactorToken } from "../utils/twoFactor";
import { sendTwoFactorEmail } from "../utils/email";
import { AppError } from "../utils/appError";

interface RegisterDTO {
  nome: string;
  email: string;
  senha: string;
}

interface LoginDTO {
  email: string;
  senha: string;
}

interface VerifyTwoFactorDTO {
  tokenId: string;
  code: string;
}

interface ResetPasswordDTO {
  tokenId: string;
  code: string;
  novaSenha: string;
}

interface LoginMeta {
  userAgent?: string;
  ip?: string;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}

async function createSession(userId: string, meta: LoginMeta) {
  return prisma.sessao.create({
    data: {
      usuarioId: userId,
      userAgent: meta.userAgent,
      ip: meta.ip,
    },
  });
}

function signToken(userId: string, sessionId: string) {
  return jwt.sign({ userId, sessionId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

export async function registerService(data: RegisterDTO) {
  const { nome, email, senha } = data;

  const userExists = await prisma.usuario.findUnique({
    where: { email },
  });

  if (userExists) {
    throw new AppError("EMAIL_ALREADY_EXISTS", "E-mail ja cadastrado.", 409);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const user = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaHash,
    },
  });

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    remuneracao: user.remuneracao,
    fotoPerfil: user.fotoPerfil,
  };
}

export async function loginService(data: LoginDTO, meta: LoginMeta) {
  const { email, senha } = data;

  const user = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("INVALID_CREDENTIALS", "E-mail ou senha invalidos.", 401);
  }

  const senhaValida = await bcrypt.compare(senha, user.senha);

  if (!senhaValida) {
    throw new AppError("INVALID_CREDENTIALS", "E-mail ou senha invalidos.", 401);
  }

  if (user.twoFactorEnabled) {
    await prisma.twoFactorToken.deleteMany({
      where: { usuarioId: user.id, tipo: "login" },
    });
    const { tokenId, code } = await createTwoFactorToken(user.id, "login");
    await sendTwoFactorEmail(user.email, code, "login");

    return {
      requiresTwoFactor: true,
      twoFactorTokenId: tokenId,
      email: maskEmail(user.email),
    };
  }

  const session = await createSession(user.id, meta);
  const token = signToken(user.id, session.id);

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      remuneracao: user.remuneracao,
      fotoPerfil: user.fotoPerfil,
    },
  };
}

export async function verifyTwoFactorLoginService(
  data: VerifyTwoFactorDTO,
  meta: LoginMeta
) {
  const { tokenId, code } = data;
  const token = await verifyTwoFactorToken(tokenId, code, "login");

  if (!token.usuario.twoFactorEnabled) {
    throw new AppError(
      "TWO_FACTOR_DISABLED",
      "A autenticacao em duas etapas esta desativada.",
      400
    );
  }

  await prisma.twoFactorToken.delete({ where: { id: tokenId } });

  const session = await createSession(token.usuario.id, meta);
  const jwtToken = signToken(token.usuario.id, session.id);

  return {
    token: jwtToken,
    user: {
      id: token.usuario.id,
      nome: token.usuario.nome,
      email: token.usuario.email,
      remuneracao: token.usuario.remuneracao,
      fotoPerfil: token.usuario.fotoPerfil,
    },
  };
}

export async function logoutService(sessionId: string) {
  await prisma.sessao.update({
    where: { id: sessionId },
    data: { revogadoEm: new Date() },
  });
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!user) {
    return { tokenId: null, email: maskEmail(email) };
  }

  await prisma.twoFactorToken.deleteMany({
    where: { usuarioId: user.id, tipo: "reset" },
  });

  const { tokenId, code } = await createTwoFactorToken(user.id, "reset");
  await sendTwoFactorEmail(user.email, code, "reset");

  return {
    tokenId,
    email: maskEmail(user.email),
  };
}

export async function resetPassword(data: ResetPasswordDTO) {
  const { tokenId, code, novaSenha } = data;

  if (!novaSenha || novaSenha.length < 6) {
    throw new AppError(
      "PASSWORD_TOO_SHORT",
      "A senha deve ter pelo menos 6 caracteres.",
      400
    );
  }

  const token = await verifyTwoFactorToken(tokenId, code, "reset");

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: token.usuarioId },
    data: { senha: senhaHash },
  });

  await prisma.twoFactorToken.deleteMany({
    where: { usuarioId: token.usuarioId, tipo: "reset" },
  });

  await prisma.sessao.updateMany({
    where: { usuarioId: token.usuarioId },
    data: { revogadoEm: new Date() },
  });
}
