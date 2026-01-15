export class AppError extends Error {
  statusCode: number;
  code: string;
  userMessage: string;

  constructor(code: string, userMessage: string, statusCode = 400) {
    super(userMessage);
    this.code = code;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
  }
}

export function isAppError(err: any): err is AppError {
  return err instanceof AppError;
}

export function normalizeError(err: any) {
  if (isAppError(err)) {
    return {
      status: err.statusCode,
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
