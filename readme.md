You can create a form that takes a name, address, photo, and video input, and store this information in MongoDB, with the video being uploaded to Cloudinary. Below, I’ll guide you through building a basic HTML and CSS form for this, but please note that back-end implementation (e.g., using Node.js and Express for form handling, Cloudinary API for video uploads, and MongoDB for data storage) will be necessary.

### Frontend (HTML & CSS)
The following HTML and CSS will build a form for inputting name, address, photo, and video, which you can later handle in the backend:

#### 1. HTML (form.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form with Cloudinary Video Upload</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="form-container">
    <h1>Submit Your Details</h1>
    <form id="uploadForm" action="/submit-form" method="POST" enctype="multipart/form-data">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required>

      <label for="address">Address:</label>
      <textarea id="address" name="address" required></textarea>

      <label for="photo">Upload Photo:</label>
      <input type="file" id="photo" name="photo" accept="image/*">

      <label for="video">Upload Video:</label>
      <input type="file" id="video" name="video" accept="video/*">

      <button type="submit">Submit</button>
    </form>
  </div>
  
  <script src="script.js"></script>
</body>
</html>
```

#### 2. CSS (styles.css)

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.form-container {
  background-color: white;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

h1 {
  text-align: center;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  margin: 10px 0 5px;
  color: #555;
}

input[type="text"],
textarea {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input[type="file"] {
  padding: 5px;
  margin-bottom: 10px;
}

button {
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #218838;
}
```

### Backend (Node.js + Express + MongoDB + Cloudinary)
You’ll need a backend to handle the form data, upload the video to Cloudinary, and store the details in MongoDB. Here's a simple implementation:

#### 1. Install Dependencies
First, install the necessary dependencies:

```bash
npm init -y
npm install express mongoose multer cloudinary dotenv
```

#### 2. Create a `.env` file to store Cloudinary and MongoDB credentials

```plaintext
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MONGODB_URI=your-mongodb-uri
```

#### 3. Backend Setup (server.js)

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

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
  photoUrl: String,
  videoUrl: String,
});

const Form = mongoose.model('Form', formSchema);

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route to handle form submission
app.post('/submit-form', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    // Upload photo to Cloudinary
    const photoResult = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) return res.status(500).send('Error uploading photo');
      return result;
    }).end(req.files.photo[0].buffer);

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload_stream({ resource_type: 'video' }, (error, result) => {
      if (error) return res.status(500).send('Error uploading video');
      return result;
    }).end(req.files.video[0].buffer);

    // Save the form data to MongoDB
    const newForm = new Form({
      name: req.body.name,
      address: req.body.address,
      photoUrl: photoResult.secure_url,
      videoUrl: videoResult.secure_url
    });

    await newForm.save();

    res.send('Form submitted successfully!');
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

// Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

#### 4. Folder Structure

Your folder structure will look something like this:

```
/project-folder
  /public
    - index.html
    - styles.css
    - script.js
  server.js
  .env
  package.json
```

#### 5. Run the Server

Run the Node.js server:

```bash
node server.js
```

Now, you should have the form ready to upload the photo and video to Cloudinary and store the data in MongoDB.

---

### Key Points:
- **Cloudinary**: Handles media uploads (photo, video) via API.
- **Multer**: Handles file uploads to the server before sending to Cloudinary.
- **MongoDB**: Stores form data (name, address, photo URL, video URL).

You can adjust the size limits on the Cloudinary upload stream or handle additional validation for file types and sizes on the server side. Let me know if you need more details!