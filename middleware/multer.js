import multer from "multer";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, "../");

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png formats are allowed!"));
  }
};

const TaskImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/tasks");;
  },
  filename: (req, file, cb) => {
    const date = new Date().toISOString().split("T")[0];
    const filename = `${Date.now()}_${file.originalname}`;
    cb(null, filename);
  },
});

export const taskImageUpload = multer({
  storage: TaskImage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single("image");     
