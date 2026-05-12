const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const mysql = require("mysql2/promise");

const MARIADB_CONFIG = {
    host: "localhost",
    port: 3309,
    user: "root",
    password: "root",
    database: "event_db"
};

const upload = multer({ dest: "uploads/" });
let pdfContext = ""; // Store PDF text for RAG

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route for uploading PDF or DOCX
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let extractedText = "";

    if (fileExtension === "pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        extractedText = data.text;
    } else if (fileExtension === "docx") {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
    } else {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Chỉ hỗ trợ file PDF hoặc DOCX" });
    }
    
    pdfContext = extractedText; // Update shared context
    console.log(`File ${fileExtension} parsed successfully. Length:`, pdfContext.length);

    // Remove temp file
    fs.unlinkSync(filePath);

    res.json({
      message: `${fileExtension.toUpperCase()} đã được tải lên và xử lý thành công!`,
      length: pdfContext.length
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Lỗi xử lý file" });
  }
});

// Function to fetch database context from MariaDB
async function getDatabaseContext() {
    let connection;
    try {
        connection = await mysql.createConnection(MARIADB_CONFIG);
        
        // Lấy 5 sự kiện mới nhất từ bảng events
        const [rows] = await connection.execute(
            "SELECT title, description, location, start_time FROM events ORDER BY created_at DESC LIMIT 5"
        );
        
        if (rows.length === 0) return "";
        
        let context = "Dữ liệu từ hệ thống MariaDB (Sự kiện mới nhất):\n";
        rows.forEach(ev => {
            context += `- Sự kiện: ${ev.title}, Địa điểm: ${ev.location}, Ngày: ${ev.start_time}, Mô tả: ${ev.description}\n`;
        });
        return context;
    } catch (err) {
        console.error("MariaDB Context Error:", err);
        return "";
    } finally {
        if (connection) await connection.end();
    }
}

// Route for chat
app.post("/chat", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    const isExtraction = userPrompt.includes("Trích xuất thông tin sự kiện") || userPrompt.includes("JSON");
    
    let fullPrompt = "";
    if (isExtraction) {
        // For extraction, we want the raw prompt to avoid confusing the model
        fullPrompt = userPrompt;
        console.log("Processing Extraction Request...");
    } else {
        // Fetch context from DB and PDF for regular chat
        const dbContext = await getDatabaseContext();
        if (dbContext || pdfContext) {
            fullPrompt = `Bối cảnh hệ thống:\n${dbContext}\n${pdfContext ? "Tài liệu bổ sung:\n" + pdfContext.substring(0, 3000) : ""}\n\nCâu hỏi của người dùng: ${userPrompt}`;
        } else {
            fullPrompt = userPrompt;
        }
        console.log("Processing General Chat Request...");
    }

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "event-assistant",
          prompt: fullPrompt,
          stream: false,
          options: {
              temperature: isExtraction ? 0.1 : 0.7, // Low temp for extraction accuracy
              num_predict: 2048
          }
        })
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama Error Response:", errorText);
        throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("AI Response received successfully.");

    res.json({
      reply: data.response
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({
      error: "AI error: " + error.message
    });
  }
});

// Default route to serve the UI
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 AI server running at http://0.0.0.0:${PORT}`);
});
