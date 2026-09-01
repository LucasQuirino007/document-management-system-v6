const path = require('path');
const { randomUUID } = require('crypto');
const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
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
const fileSystemRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em instantes.' }
});

router.post('/upload', fileSystemRateLimiter, upload.single('document'), uploadDocumentController);
router.get('/documents', listDocumentsController);
router.get('/documents/:id/download', fileSystemRateLimiter, downloadDocumentController);

module.exports = router;
