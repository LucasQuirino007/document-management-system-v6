const documentsService = require('../services/documents.service');

function getOwner(req) {
  const owner = req.get('X-User-Id');
  return owner && owner.trim();
}

function sendValidationError(res, message) {
  return res.status(400).json({
    error: {
      code: 'VALIDATION_ERROR',
      message,
    },
  });
}

function requireOwner(req, res, next) {
  const owner = getOwner(req);

  if (!owner) {
    return sendValidationError(res, 'O cabeçalho X-User-Id é obrigatório.');
  }

  req.owner = owner;
  return next();
}

function uploadDocument(req, res, next) {
  if (!req.file) {
    return sendValidationError(res, 'O campo file é obrigatório.');
  }

  try {
    const document = documentsService.createDocument(req.file, req.owner);
    return res.status(201).json({ document });
  } catch (error) {
    return next(error);
  }
}

function listDocuments(req, res, next) {
  try {
    return res.json({ documents: documentsService.listDocuments(req.owner) });
  } catch (error) {
    return next(error);
  }
}

function downloadDocument(req, res, next) {
  try {
    const document = documentsService.getDocumentForDownload(req.params.id, req.owner);

    if (!document) {
      return res.status(404).json({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Documento não encontrado.',
        },
      });
    }

    return res.download(document.storedPath, document.originalName, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  requireOwner,
  uploadDocument,
  listDocuments,
  downloadDocument,
};