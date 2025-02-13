require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// Mongoose Schema
const formSchema = new mongoose.Schema({
  name: String,
  address: String,
  photoUrls: [String],  // Store multiple image URLs
  videoUrls: [String]   // Store multiple video URLs
});

const Form = mongoose.model('Form', formSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload setup (memory storage for buffering files)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to upload files to Cloudinary
const uploadToCloudinary = (fileBuffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// POST route to handle form submission
app.post('/submit-form', upload.fields([
  { name: 'photo', maxCount: 10 },  // Match the field name from HTML
  { name: 'video', maxCount: 10 }
]), async (req, res) => {
  try {
    console.log('Received files:', req.files);  // Debugging line
    console.log('Received body:', req.body);

    if (!req.files || (!req.files.photo && !req.files.video)) {
      return res.status(400).json({ message: 'At least one photo or video is required' });
    }

    // Upload photos to Cloudinary
    const photoUrls = req.files.photo ? 
      await Promise.all(req.files.photo.map(file => uploadToCloudinary(file.buffer, 'image'))) 
      : [];

    // Upload videos to Cloudinary
    const videoUrls = req.files.video ? 
      await Promise.all(req.files.video.map(file => uploadToCloudinary(file.buffer, 'video'))) 
      : [];

    // Save form data to MongoDB
    const newForm = new Form({
      name: req.body.name,
      address: req.body.address,
      photoUrls,
      videoUrls
    });

    await newForm.save();

    res.json({ message: 'Form submitted successfully!', form: newForm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

// GET route to fetch all submitted forms
app.get('/forms', async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching forms' });
  }
});

// Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
