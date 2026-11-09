import { FirebaseError } from 'firebase/app';

const DEFAULT_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

const KNOWN_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha é muito fraca.',
  'auth/too-many-requests':
    'Muitas tentativas. Aguarde um instante e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'permission-denied': 'Você não tem permissão para realizar esta ação.',
  unavailable: 'Serviço indisponível. Verifique sua conexão e tente novamente.',
};

/** Códigos de HttpsError cujas mensagens (em pt-BR) vêm do backend. */
const BACKEND_MESSAGE_CODES = new Set([
  'functions/invalid-argument',
  'functions/not-found',
  'functions/permission-denied',
  'functions/unauthenticated',
  'functions/failed-precondition',
]);

/** Converte erros do Firebase em mensagens amigáveis para o usuário. */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return DEFAULT_MESSAGE;
  }

  if (BACKEND_MESSAGE_CODES.has(error.code)) {
    // O SDK de functions anexa o status HTTP ao fim da mensagem (ex.: " [400]").
    return error.message.replace(/\s*\[\d{3}\]$/, '');
  }

  return KNOWN_MESSAGES[error.code] ?? DEFAULT_MESSAGE;
}
