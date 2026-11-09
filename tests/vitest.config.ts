import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

// Os testes das functions importam o código de ../functions/src. Para que o
// helper use a MESMA cópia do firebase-admin das functions (e não uma segunda
// instalação, com classes Timestamp incompatíveis), o import é redirecionado.
const requireFromFunctions = createRequire(
  new URL('../functions/package.json', import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: {
      'firebase-admin/firestore': requireFromFunctions.resolve(
        'firebase-admin/firestore',
      ),
    },
  },
  test: {
    include: ['rules/**/*.test.ts', 'functions/**/*.test.ts'],
    // Todos os arquivos compartilham o mesmo emulador do Firestore.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
