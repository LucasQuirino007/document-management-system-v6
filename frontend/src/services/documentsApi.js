// Cliente HTTP para a API de documentos, consumida via prefixo /api (proxy do Vite).

const API_BASE_URL = '/api';

async function parseErrorMessage(response) {
  try {
    const data = await response.json();
    return data?.error?.message || 'Erro inesperado ao comunicar com o servidor.';
  } catch {
    return 'Erro inesperado ao comunicar com o servidor.';
  }
}

async function ensureOk(response) {
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response;
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await ensureOk(
    await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': owner },
      body: formData,
    }),
  );

  const { document } = await response.json();
  return document;
}

export async function listDocuments(owner) {
  const response = await ensureOk(
    await fetch(`${API_BASE_URL}/documents`, {
      headers: { 'X-User-Id': owner },
    }),
  );

  const { documents } = await response.json();
  return documents;
}

export async function downloadDocument(documentId, owner, originalName) {
  const response = await ensureOk(
    await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      headers: { 'X-User-Id': owner },
    }),
  );

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
