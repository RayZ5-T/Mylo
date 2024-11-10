const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up the upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer
const upload = multer({ storage });

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(uploadDir));

// Endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.json({
        message: 'File uploaded successfully',
        file: req.file
    });
});

// Endpoint to list all uploaded files
app.get('/uploads', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read uploads directory' });
        }
        
        const fileDetails = files.map(file => ({
            name: file,
            uploadDate: fs.statSync(path.join(uploadDir, file)).mtime
        }));
        
        res.json(fileDetails);
    });
});

// Serve the index.html file
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
