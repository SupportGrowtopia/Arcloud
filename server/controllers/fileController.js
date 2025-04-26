const fs = require('fs');
const path = require('path');

exports.uploadFile = (req, res) => {
  res.send({ message: 'File uploaded' });
};

exports.getFiles = (req, res) => {
  fs.readdir(path.join(__dirname, '../uploads'), (err, files) => {
    if (err) return res.status(500).send('Error reading files');
    res.json(files);
  });
};
