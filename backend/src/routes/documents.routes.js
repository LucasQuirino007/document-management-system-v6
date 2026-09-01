const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');

const storagePath = process.env.STORAGE_PATH || path.resolve(__dirname, '../../storage');
const maxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES) || 10485760;

fs.mkdirSync(storagePath, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: storagePath,
    filename: (req, file, callback) => callback(null, randomUUID()),
  }),
  limits: { fileSize: maxFileSize },
});

const router = express.Router();

router.post('/upload', documentsController.requireOwner, upload.single('file'), documentsController.uploadDocument);
router.get('/documents', documentsController.requireOwner, documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.requireOwner, documentsController.downloadDocument);

module.exports = router;