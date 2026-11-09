import { Timestamp } from 'firebase-admin/firestore';

export const PROJECT_ID = 'demo-sendflow';

// Define o projeto antes de importar qualquer módulo que chame initializeApp().
process.env.GCLOUD_PROJECT ??= PROJECT_ID;
// Evita a espera pela detecção de credenciais do Google Cloud (só usamos o emulador).
process.env.METADATA_SERVER_DETECTION ??= 'none';

/** Apaga todos os documentos do emulador do Firestore. */
export async function clearFirestore(): Promise<void> {
  const host = process.env.FIRESTORE_EMULATOR_HOST;

  if (!host) {
    throw new Error(
      'FIRESTORE_EMULATOR_HOST não definido. Rode via `npm run test:rules` ' +
        '(firebase emulators:exec).',
    );
  }

  const url = `http://${host}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  const response = await fetch(url, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`Falha ao limpar o emulador: ${response.status}`);
  }
}

export const now = (): Timestamp => Timestamp.now();
