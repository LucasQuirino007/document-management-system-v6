function toDocumentView(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner
  };
}

module.exports = {
  toDocumentView
};
