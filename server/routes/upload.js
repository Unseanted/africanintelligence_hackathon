const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadfile, publicfile, deletefile } = require('../services/cloudManager');
const { datemap } = require('./basics');
const { Bar } = require('../services/globalServices');
const { findOne } = require('../services/globalServices');
const { deleteOne } = require('../services/globalServices');
const { tagz } = require('../services/globalServices');
const { putInCollection } = require('../services/globalServices');
// const { validateToken } = require('../middleware/TokenAuth');

const uploadDir = path.join(__dirname, '../uploads');

// Configure multer storage for temporary files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalname = file.originalname;
    cb(null, `${timestamp}-${originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
  }
});


router.post('/', (req, res, next) => {
  // Debug logging to inspect the request before multer
  console.log('Incoming request headers:', req.headers);
  console.log('Incoming request body (before multer):', req.body);

  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ success: false, error: 'File upload failed: ' + err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const file = req.file;
      const fileType = req.body.fileType || 'document'; // document, image, video, audio
      const dt = datemap();

      // Check for xfileUrl to delete the previous file
      const { xfileUrl } = req.body;
      if (xfileUrl) {
        const existingFile = await findOne(tagz[0], { fileUrl: xfileUrl });
        if (existingFile) {
          await deletefile({
            b: Bar[0],
            f: existingFile.filename
          });
          await deleteOne(tagz[0], { fileUrl: xfileUrl });
        }
      }

      // Determine the bucket and folder structure based on file type
      let bucketName = Bar[0];
      let folderPath = `${fileType}s/`;

      // For specific user uploads, we can add more structure
      if (req.body.userId) {
        folderPath += `${req.body.userId}/`;
      }

      // Define the destination filename in GCP
      const destinationFilename = `${folderPath}${dt.key}-${file.originalname}`;

      // Upload to Google Cloud Storage
      await new Promise((resolve, reject) => {
        uploadfile({
          b: bucketName,
          pth: file.path,
          f: destinationFilename
        }, async (z) => {
          if (!z) {
            return reject(new Error('Upload failed'));
          }

          const d = z[0].metadata;

          // Save file metadata to uploadedFiles collection
          putInCollection(tagz[0], { filename: destinationFilename }, {
            fileUrl: d.mediaLink,
            filename: destinationFilename,
            type: fileType,
            size: file.size
          });

          // Clean up the temporary file
          fs.unlinkSync(file.path);

          resolve({
            success: true,
            fileUrl: d.mediaLink,
            selfUrl: d.selfLink,
            filename: destinationFilename,
            type: fileType,
            size: file.size,
            success: true
          });
        });
      }).then((response) => {
        res.json(response);
      }).catch((error) => {
        throw error;
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ success: false, error: 'File upload failed: ' + error.message });
    }
  });
});

// Delete endpoint to remove a file
router.delete('/delete', async (req, res) => {
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ success: false, error: 'fileUrl is required' });
    }

    const existingFile = await findOne(tagz[0], { fileUrl });
    if (!existingFile) {
      return res.status(404).json({ success: false, error: 'File not found in database' });
    }

    await deletefile({
      b: Bar[0],
      f: existingFile.filename
    });

    await deleteOne(tagz[0], { fileUrl });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ success: false, error: 'File deletion failed: ' + error.message });
  }
});

module.exports = router;