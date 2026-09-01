const { randomUUID } = require('crypto');
const documentsRepository = require('../repositories/documents.repository');

function toPublicMetadata(document) {
  const { storedFilename, storedPath, ...publicMetadata } = document;
  return publicMetadata;
}

function createDocument(file, owner) {
  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    owner,
    storedFilename: file.filename,
    storedPath: file.path,
  };

  return toPublicMetadata(documentsRepository.create(document));
}

function listDocuments(owner) {
  return documentsRepository.findByOwner(owner).map(toPublicMetadata);
}

function getDocumentForDownload(id, owner) {
  return documentsRepository.findByIdAndOwner(id, owner);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};