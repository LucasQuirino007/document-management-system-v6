const { randomUUID } = require('crypto');
const documentRepository = require('../repositories/inMemoryDocumentRepository');
const { ServiceError } = require('./errors');
const { toDocumentView } = require('./documentViewMapper');

function registerDocument({ file, owner }) {
  if (!file) {
    throw new ServiceError('Arquivo é obrigatório para upload.', 400);
  }

  const safeOwner = owner && owner.trim() ? owner.trim() : 'anonymous';
  const storedDocument = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: safeOwner,
    storagePath: file.path
  };

  const createdDocument = documentRepository.save(storedDocument);
  return toDocumentView(createdDocument);
}

module.exports = {
  registerDocument
};
