const { beforeEach, after, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');
const documentRepository = require('../src/repositories/inMemoryDocumentRepository');

const STORAGE_DIR = path.resolve(__dirname, '../storage');

let server;
let baseUrl;

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

beforeEach(async () => {
  documentRepository.clear();
  await fs.mkdir(STORAGE_DIR, { recursive: true });

  const files = await fs.readdir(STORAGE_DIR);
  await Promise.all(
    files
      .filter((fileName) => fileName !== '.gitkeep')
      .map((fileName) => fs.unlink(path.join(STORAGE_DIR, fileName)))
  );

  if (!server) {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  }
});

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('GET /health responde com status ok', async () => {
  const response = await fetch(`${baseUrl}/health`);
  const payload = await response.json();

  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(payload, { status: 'ok' });
});

test('POST /upload salva metadados e GET /documents lista o documento', async () => {
  const formData = new FormData();
  formData.append('owner', 'lucas');
  formData.append('document', new Blob(['conteudo de teste']), 'contrato.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData
  });
  const createdDocument = await uploadResponse.json();

  assert.strictEqual(uploadResponse.status, 201);
  assert.ok(createdDocument.id);
  assert.strictEqual(createdDocument.originalName, 'contrato.txt');
  assert.strictEqual(createdDocument.owner, 'lucas');

  const listResponse = await fetch(`${baseUrl}/documents`);
  const listPayload = await listResponse.json();

  assert.strictEqual(listResponse.status, 200);
  assert.strictEqual(listPayload.length, 1);
  assert.strictEqual(listPayload[0].id, createdDocument.id);
});

test('GET /documents/:id/download baixa o arquivo pelo id', async () => {
  const formData = new FormData();
  formData.append('document', new Blob(['arquivo para download']), 'arquivo.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData
  });
  const createdDocument = await uploadResponse.json();

  const downloadResponse = await fetch(`${baseUrl}/documents/${createdDocument.id}/download`);
  const downloadedContent = await downloadResponse.text();

  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(
    downloadResponse.headers.get('content-disposition'),
    'attachment; filename="arquivo.txt"'
  );
  assert.strictEqual(downloadedContent, 'arquivo para download');
});

test('GET /documents/:id/download responde 404 para documento inexistente', async () => {
  const response = await fetch(`${baseUrl}/documents/id-inexistente/download`);
  const payload = await response.json();

  assert.strictEqual(response.status, 404);
  assert.strictEqual(payload.error, 'Documento não encontrado.');
});
