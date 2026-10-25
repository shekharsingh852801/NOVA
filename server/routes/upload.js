import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|webp|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Images only! (jpeg, jpg, png, webp, gif)"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
const uploadHomepageImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

function sendUploadedImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Construct the URL to access the uploaded file
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  
  res.json({
    message: "File uploaded successfully",
    url: fileUrl,
    filename: req.file.filename,
  });
}

// Product media keeps its existing 5 MB limit.
router.post("/", authenticateAdmin, upload.single("image"), sendUploadedImage);

// Homepage editor images have a dedicated 5 MB limit.
router.post("/homepage", authenticateAdmin, (req, res, next) => {
  uploadHomepageImage.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Homepage images must be 5 MB or smaller" });
    }
    if (error) return next(error);
    return sendUploadedImage(req, res);
  });
});

export default router;
