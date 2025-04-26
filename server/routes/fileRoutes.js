// server/routes/fileRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Konfigurasi storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = req.body.folder || '';
      const uploadPath = path.join(__dirname, '../uploads', folder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const folder = req.body.folder || '';
      const uploadPath = path.join(__dirname, '../uploads', folder);
      let originalName = file.originalname;
      let filePath = path.join(uploadPath, originalName);
      let counter = 1;
  
      while (fs.existsSync(filePath)) {
        const ext = path.extname(originalName);
        const base = path.basename(originalName, ext);
        originalName = `${base} (${counter})${ext}`;
        filePath = path.join(uploadPath, originalName);
        counter++;
      }
      cb(null, originalName);
    },
  });  

const upload = multer({ storage });

// Upload route
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send('File uploaded successfully');
});

// List files route
router.get('/files', (req, res) => {
  const folder = req.query.folder || '';
  const folderPath = path.join(__dirname, '../uploads', folder);

  fs.readdir(folderPath, (err, items) => {
    if (err) return res.status(500).send('Error reading folder');
    const files = items.filter(item => {
      const fullPath = path.join(folderPath, item);
      return fs.statSync(fullPath).isFile();
    });
    res.json(files);
  });
});

module.exports = router;
