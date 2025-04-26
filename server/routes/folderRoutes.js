const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Buat folder baru
router.post('/folder/delete', (req, res) => {
    const { folderName } = req.body;
    const folderPath = path.join(__dirname, '../uploads', folderName);
  
    if (!fs.existsSync(folderPath)) {
      return res.status(404).send('Folder tidak ditemukan');
    }
  
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) return res.status(500).send('Error hapus folder');
      res.send('Folder berhasil dihapus');
    });
  });
  
  
  

// Ambil semua folder
router.get('/folders', (req, res) => {
  const uploadsPath = path.join(__dirname, '../uploads');

  fs.readdir(uploadsPath, (err, items) => {
    if (err) return res.status(500).send('Error reading uploads folder');

    const folders = items.filter(item => {
      const fullPath = path.join(uploadsPath, item);
      return fs.statSync(fullPath).isDirectory();
    });

    res.json(folders);
  });
});

module.exports = router;
