class InMemoryDocumentRepository {
  constructor() {
    this.documents = [];
  }

  save(document) {
    this.documents.push(document);
    return document;
  }

  list() {
    return [...this.documents];
  }

  findById(id) {
    return this.documents.find((document) => document.id === id) || null;
  }

  clear() {
    this.documents = [];
  }
}

module.exports = new InMemoryDocumentRepository();
