const path = require('path');
const { randomUUID } = require('crypto');
const express = require('express');
const multer = require('multer');
const {
  uploadDocumentController,
  listDocumentsController,
  downloadDocumentController
} = require('../controllers/documentsController');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, path.resolve(__dirname, '../../storage'));
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${randomUUID()}${extension}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

router.post('/upload', upload.single('document'), uploadDocumentController);
router.get('/documents', listDocumentsController);
router.get('/documents/:id/download', downloadDocumentController);

module.exports = router;
