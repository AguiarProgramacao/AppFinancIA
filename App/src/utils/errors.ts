export class ApiError extends Error {
  code?: string;
  status?: number;
  userMessage: string;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.userMessage = message;
  }
}

const codeMap: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "E-mail ja cadastrado.",
  INVALID_CREDENTIALS: "E-mail ou senha invalidos.",
  PASSWORD_TOO_SHORT: "A senha deve ter pelo menos 6 caracteres.",
  INVALID_2FA_CODE: "Codigo invalido. Tente novamente.",
  EXPIRED_2FA_CODE: "Codigo expirado. Solicite outro.",
  TWO_FACTOR_DISABLED: "A autenticacao em duas etapas esta desativada.",
  TWO_FACTOR_ALREADY_ENABLED: "A autenticacao em duas etapas ja esta ativa.",
  USER_NOT_FOUND: "Usuario nao encontrado.",
  CATEGORY_NOT_FOUND: "Categoria nao encontrada.",
  TRANSACTION_NOT_FOUND: "Transacao nao encontrada.",
  GOAL_NOT_FOUND: "Objetivo nao encontrado.",
  SESSION_EXPIRED: "Sua sessao expirou. Faca login novamente.",
  TOKEN_INVALID: "Token invalido. Faca login novamente.",
  TOKEN_MISSING: "Token nao informado. Faca login novamente.",
  INVALID_REMUNERATION: "Remuneracao invalida.",
  INVALID_PUSH_TOKEN: "Token de notificacao invalido.",
  DUPLICATE_RESOURCE: "Esse registro ja existe.",
  EMAIL_REQUIRED: "Informe o e-mail.",
  RESET_PASSWORD_REQUIRED_FIELDS: "Preencha codigo e nova senha.",
  INVALID_GOAL_DEPOSIT: "Informe um valor valido para o aporte.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

export function getErrorMessage(err: any, fallback: string) {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  const code = err.code || err?.response?.code || err?.data?.code;
  if (code && codeMap[code]) {
    return codeMap[code];
  }

  const message =
    err.userMessage || err.message || err?.response?.error || err?.data?.error;
  return message || fallback;
}
