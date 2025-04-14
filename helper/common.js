import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const fileValidation = async (file) => {

  console.log("file==================>",file)
  if (!file) return;

  const filePath = file.path; 
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); 
  } else {
    console.log("File not found:", filePath);
  }
};


export const deleteImage = (imagePath) => {
  const filePath=formatFilePath(imagePath)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); 
  } else {
    console.error(`File not found: ${filePath}`);
  }
};


export const formatFilePath = (filePath) => {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/'); 
};
