const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");
  const { exec } = require("child_process");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup storage using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Only PDF files allowed."));
  },
});

// Upload route
app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const filePath = path.resolve(req.file.path);

  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    const allText = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      content.items.forEach(item => {
        const text = item.str.trim();
        const transform = item.transform;
        const fontSize = Math.round(transform[0]);

        if (text.length > 0) {
          allText.push({ text, fontSize });
        }
      });
    }

    // Extract title (first large text)
    let title = "Untitled";
    for (let i = 0; i < allText.length; i++) {
      if (allText[i].fontSize > 20) {
        title = allText[i].text;
        break;
      }
    }

    // Extract all H3 headings
    const h3Lines = allText
      .filter(({ fontSize }) => fontSize > 12 && fontSize <= 16)
      .map(({ text }) => text);

    // Group H3 lines into structured programs
    const programs = [];
    let temp = {};

    h3Lines.forEach(line => {
      if (/^\d+\.$/.test(line)) {
        if (temp.number && temp.title) {
          programs.push(temp);
        }
        temp = { number: line.replace(".", ""), title: "" };
      } else if (temp.number) {
        temp.title += (temp.title ? " " : "") + line;
      }
    });

    if (temp.number && temp.title) {
      programs.push(temp);
    }

    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    // Extract main text from PDF
    const mainText = allText.map(item => item.text).join(' ');

    // Write mainText to a temporary file
    const tmpMainTextPath = path.join(__dirname, "ai", `main_text_${Date.now()}.txt`);
    fs.writeFileSync(tmpMainTextPath, mainText);

    // Prepare input for custom summarizer
    const summarizerInput = {
      title,
      headings: programs.map(p => p.title).join("; "),
      mainTextPath: tmpMainTextPath
    };

    // Pass path to Python script
    const pythonPath = "py"; // or "python" on Windows
    const scriptPath = path.join(__dirname, "ai", "custom_summarizer.py");
    const args = `"${summarizerInput.title}" "${summarizerInput.headings}" "${summarizerInput.mainTextPath}"`;

    exec(`${pythonPath} "${scriptPath}" ${args}`, (error, stdout, stderr) => {
      // Optionally delete temp file after use
      fs.unlinkSync(tmpMainTextPath);

      if (error) {
        console.error("Python error:", error);
        return res.status(500).json({ error: "Failed to summarize PDF." });
      }

      const summary = stdout.trim();

      res.json({
        message: "PDF parsed and summarized successfully",
        structured: {
          title,
          programs,
          summary
        },
        fileUrl,
        originalName: req.file.originalname
      });
    });

  } catch (error) {
    console.error("Error parsing PDF:", error);
    res.status(500).json({ error: "Failed to parse PDF." });
  }
});


// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
