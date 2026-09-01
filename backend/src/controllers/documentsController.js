const { registerDocument } = require('../services/registerDocumentService');
const { listDocuments } = require('../services/listDocumentsService');
const { getDocumentDownloadData } = require('../services/getDocumentDownloadService');

function uploadDocumentController(req, res, next) {
  try {
    const document = registerDocument({
      file: req.file,
      owner: req.body.owner
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

function listDocumentsController(req, res, next) {
  try {
    const documents = listDocuments({
      owner: req.query.owner
    });

    res.json(documents);
  } catch (error) {
    next(error);
  }
}

async function downloadDocumentController(req, res, next) {
  try {
    const downloadData = await getDocumentDownloadData(req.params.id);
    res.download(downloadData.path, downloadData.originalName);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDocumentController,
  listDocumentsController,
  downloadDocumentController
};
