const documentRepository = require('../repositories/inMemoryDocumentRepository');
const { toDocumentView } = require('./documentViewMapper');

function listDocuments({ owner }) {
  const allDocuments = documentRepository.list();

  const documents = owner
    ? allDocuments.filter((document) => document.owner === owner)
    : allDocuments;

  return documents.map(toDocumentView);
}

module.exports = {
  listDocuments
};
