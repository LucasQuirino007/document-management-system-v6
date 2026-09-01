const path = require('path');
const fs = require('fs/promises');
const documentRepository = require('../repositories/inMemoryDocumentRepository');
const { ServiceError } = require('./errors');

const STORAGE_DIR = path.resolve(__dirname, '../../storage');
const STORAGE_PREFIX = `${STORAGE_DIR}${path.sep}`;

async function getDocumentDownloadData(documentId) {
  const document = documentRepository.findById(documentId);

  if (!document) {
    throw new ServiceError('Documento não encontrado.', 404);
  }

  const absoluteStoragePath = path.resolve(document.storagePath);

  if (absoluteStoragePath !== STORAGE_DIR && !absoluteStoragePath.startsWith(STORAGE_PREFIX)) {
    throw new ServiceError('Caminho de arquivo inválido.', 400);
  }

  try {
    await fs.access(absoluteStoragePath);
  } catch {
    throw new ServiceError('Arquivo do documento não está mais disponível.', 404);
  }

  return {
    path: absoluteStoragePath,
    originalName: document.originalName
  };
}

module.exports = {
  getDocumentDownloadData
};
