const express = require('express');
const fs = require('fs');
const archiver = require('archiver');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { getFileStructure } = require('./fileStructure');

const app = express();
const port = 3000;

// CORS Middleware
app.use(cors({
  origin: "http://localhost:5173"
}));

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/fileStructure', (req, res) => {
  const rootFolder = path.resolve(__dirname);
  
  getFileStructure(rootFolder).then(fileStructure => {
    res.json(fileStructure); // send as JSON
  }).catch(err => {
    console.error('Error reading file structure:', err);
    res.status(500).send('Error reading file structure');
  });
});

app.get('/download', (req, res) => {
  const filePath = req.query.path;
  
  // check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      return res.status(404).send('File not found');
    }

    // set the appropriate headers for the response
    const fileName = path.basename(filePath);
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-type', 'application/octet-stream');

    // create a read stream to send the file contents in the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

app.get('/downloadFolder', (req, res) => {
  const folderPath = req.query.path;

  const zipFileName = path.basename(folderPath) + '.zip';

  // create a writable stream to send the zip file as response
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${zipFileName}"`
  });

  // create a zip archive
  const archive = archiver('zip', {
    // set the compression level
    zlib: { level: 9 }
  });

  // pipe the archive to the response stream
  archive.pipe(res);
  // add all files and subfolders in the folder to the archive
  archive.directory(folderPath, path.basename(folderPath));
  archive.finalize();

  // log an error if there's an issue with archiving
  archive.on('error', function(err) {
      console.error('Error archiving folder:', err);
      res.status(500).send('Error archiving folder');
  });
});

app.delete('/deleteFile', (req, res) => {
  const filePath = req.query.path;

  // check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      return res.status(404).send('File not found');
    }

    // delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).send('Error deleting file');
      }
      
      console.log('File deleted successfully');
      res.status(200).send('File deleted successfully');
    });
  });
});

app.delete('/deleteFolder', (req, res) => {
  const folderPath = req.query.path;

  // check if the folder exists
  fs.access(folderPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Folder not found:', err);
      return res.status(404).send('Folder not found');
    }

    // delete the folder recursively
    fs.rm(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error deleting folder:', err);
        return res.status(500).send('Error deleting folder');
      }
      
      console.log('Folder deleted successfully');
      res.status(200).send('Folder deleted successfully');
    });
  });
});

app.put('/rename', (req, res) => {
  const oldFilePath = req.body.oldPath;
  const newFileName = req.body.newName;

  const newFilePath = path.join(path.dirname(oldFilePath), newFileName);

  // иename the file
  fs.rename(oldFilePath, newFilePath, (err) => {
      if (err) {
          console.error('Error renaming file:', err);
          return res.status(500).send('Error renaming file');
      }
      
      console.log('File renamed successfully');
      res.status(200).send('File renamed successfully');
  });
});


var storage = multer.diskStorage ({
  destination : './',
  filename: function (req, file, cb) {
    cb (null, file.originalname)
  }
})

var upload = multer({ storage: storage }).single('file');

app.post('/upload', upload, function (req, res){
  console.log(req.file)
  res.send('Success!')
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});