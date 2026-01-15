export class AppError extends Error {
  status: number;
  code: string;
  userMessage: string;

  constructor(code: string, userMessage: string, status = 400) {
    super(userMessage);
    this.code = code;
    this.userMessage = userMessage;
    this.status = status;
  }
}

export function normalizeError(err: any) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      code: err.code,
      message: err.userMessage,
    };
  }

  if (err?.code === "P2002") {
    return {
      status: 409,
      code: "DUPLICATE_RESOURCE",
      message: "Esse registro ja existe.",
    };
  }

  return {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Ocorreu um erro inesperado. Tente novamente.",
  };
}
