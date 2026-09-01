const documents = [];

function create(document) {
  documents.push(document);
  return document;
}

function findByOwner(owner) {
  return documents
    .filter((document) => document.owner === owner)
    .sort((firstDocument, secondDocument) => (
      new Date(secondDocument.uploadedAt) - new Date(firstDocument.uploadedAt)
    ));
}

function findByIdAndOwner(id, owner) {
  return documents.find((document) => document.id === id && document.owner === owner);
}

module.exports = {
  create,
  findByOwner,
  findByIdAndOwner,
};