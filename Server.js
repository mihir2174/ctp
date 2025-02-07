const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 3002;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("/home/u710854811/public_html/uploads"));

// Nodemailer configuration for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chintantrivediphotography@gmail.com", // Replace with your Gmail address
    pass: "kqup bkhs fshw rczj", // Replace with your App Password or Gmail account password
  },
});

app.post("/send-email", (req, res) => {
  const {
    name,
    email,
    number,
    subject,
    howDidYouHear,
    weddingLocationDate,
    weddingEvents,
  } = req.body;

  const mailOptions = {
    from: "chintantrivediphotography@gmail.com", // Your Gmail address
    to: "chintantrivediphotography@gmail.com", // Replace with your receiving email
    subject: `New Contact Form Submission: ${subject}`,
    text: `
      Name: ${name}
      Email: ${email}
      Number: ${number}
      Subject: ${subject}
      How did you hear about us: ${howDidYouHear}
      Wedding Location & Date: ${weddingLocationDate}
      Wedding Events: ${weddingEvents}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email.");
    } else {
      console.log("Email sent:", info.response);
      res.status(200).send("Email sent successfully!");
    }
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/home/u710854811/public_html/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage: storage });

// Get all images
app.get("/api/images", (req, res) => {
  const query = "SELECT * FROM images";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching images:", err);
      res.status(500).send("Error fetching images.");
    } else {
      res.status(200).json(results);
    }
  });
});

// Add a new image
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image uploaded.");
  }

  // Get the public URL of the uploaded image
  const imageUrl = `https://chintantrivediphotography.com/uploads/${req.file.filename}`;

  // Store the image URL in MySQL
  const query = "INSERT INTO images (image) VALUES (?)";
  db.query(query, [imageUrl], (err, results) => {
    if (err) {
      console.error("Error saving image URL:", err);
      res.status(500).send("Error saving image.");
    } else {
      res
        .status(200)
        .json({ message: "Image uploaded successfully!", url: imageUrl });
    }
  });
});

// Delete an image
app.delete("/api/images/:id", (req, res) => {
  const { id } = req.params;
  // console.log("id-------?", id);

  // Get the image path before deleting
  const selectQuery = "SELECT image FROM images WHERE id = ?";
  db.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching image:", err);
      return res.status(500).send("Error fetching image.");
    }

    if (results.length === 0) {
      return res.status(404).send("Image not found.");
    }

    const imagePath = results[0].image;

    // Delete the image record from the database
    const deleteQuery = "DELETE FROM images WHERE id = ?";
    db.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error("Error deleting image:", err);
        res.status(500).send("Error deleting image.");
      } else {
        // Optionally delete the file from the server
        const fs = require("fs");
        fs.unlink(`.${imagePath}`, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });

        res.status(200).send("Image deleted successfully!");
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
