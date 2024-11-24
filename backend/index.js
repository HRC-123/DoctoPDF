// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxConverter = require("docx-pdf");
const fs = require("fs");
const fsp = require("fs").promises; // Rename fs.promises to avoid conflicts

const path = require("path");
const mammoth = require("mammoth");
const PDFDocument = require("pdfkit");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());


const uploadDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

async function ensureDirectories() {
  await fsp.mkdir(uploadDir, { recursive: true }); // Use fsp (promise-based fs)
  await fsp.mkdir(outputDir, { recursive: true }); // Use fsp (promise-based fs)
}

ensureDirectories()
  .then(() => console.log("Directories ensured"))
  .catch((err) => console.error("Error ensuring directories:", err));

// Helper function to convert DOCX to PDF
async function convertDocxToPdf(inputPath, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ path: inputPath });
      const html = result.value;

      // Create PDF from HTML
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      const writeStream = fs.createWriteStream(outputPath); // Use the core fs module
      doc.pipe(writeStream);

      // Add the HTML content to PDF
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(html.replace(/<[^>]*>/g, ""), {
          align: "left",
          lineGap: 5,
        });

      doc.end();

      // Wait for PDF creation to complete
      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}


// File upload and conversion endpoint
app.post("/convert", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("file came")

  try {
    const inputPath = req.file.path;
    console.log("checking file");
    const outputPath = path.join(outputDir, `${req.file.filename}.pdf`);

    // Get file metadata
    const stats = await fs.stat(inputPath);
    const metadata = {
      originalName: req.file.originalname,
      size: stats.size,
      uploadDate: stats.mtime,
      type: req.file.mimetype,
    };

    // Convert the file
    await convertDocxToPdf(inputPath, outputPath);

    // Clean up the uploaded file
    await fsp.unlink(inputPath); // Use promise-based unlink

    res.json({
      message: "File converted successfully",
      metadata,
      outputFilename: `${req.file.filename}.pdf`,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({ error: "File conversion failed" });
  }
});

// Download endpoint
app.get("/download/:filename", async (req, res) => {
  const filePath = path.join(outputDir, req.params.filename);
  try {
    await fsp.access(filePath); // Use promise-based access

    res.download(filePath);
  } catch (error) {
    res.status(404).json({ error: "File not found" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
