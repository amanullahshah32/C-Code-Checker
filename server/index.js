const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const ExcelJS = require("exceljs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
const resultsDir = path.join(__dirname, "results");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a unique session directory for each upload
    const sessionId = req.sessionId || uuidv4();
    req.sessionId = sessionId;
    const sessionDir = path.join(uploadsDir, sessionId);

    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    cb(null, sessionDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only accept .c files
    if (file.originalname.toLowerCase().endsWith(".c")) {
      cb(null, true);
    } else {
      cb(new Error("Only .c files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 1000, // Max 1000 files
  },
});

// Store latest results for download
let latestResults = null;
let latestConfig = null;
let latestErrorLog = null;

// =============================================================================
// API Routes
// =============================================================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Autograder server is running" });
});

// Main grading endpoint
app.post("/api/grade", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    const config = JSON.parse(req.body.config || "{}");
    const sessionId = req.sessionId;
    const sessionDir = path.join(uploadsDir, sessionId);

    console.log(`📁 Received ${files.length} files for grading`);
    console.log(`📋 Config:`, config);

    // Call Python grading API
    const pythonResponse = await axios.post(
      `${PYTHON_API_URL}/grade`,
      {
        sessionDir,
        config,
      },
      {
        timeout: 300000, // 5 minutes timeout
      }
    );

    const gradingResults = pythonResponse.data;

    // Store results for download
    latestResults = gradingResults;
    latestConfig = config;
    latestErrorLog = gradingResults.errorLog || [];

    // Generate Excel file
    await generateExcelFile(gradingResults, config, sessionId);

    // Generate error log file
    await generateErrorLogFile(gradingResults, config, sessionId);

    // Clean up uploaded files after processing
    setTimeout(() => {
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log(`🗑️ Cleaned up session ${sessionId}`);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    }, 60000); // Clean up after 1 minute

    res.json({
      success: true,
      results: gradingResults,
      errorLog: gradingResults.errorLog || [],
    });
  } catch (error) {
    console.error("Grading error:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message || "Grading failed",
    });
  }
});

// Download Excel file
app.get("/api/download-excel", async (req, res) => {
  try {
    if (!latestResults) {
      return res
        .status(404)
        .json({ error: "No results available. Please run grading first." });
    }

    // Always regenerate Excel file from latest results to ensure fresh data
    const filename = `Grades_download_${Date.now()}.xlsx`;
    const filepath = path.join(resultsDir, filename);
    await generateExcelFile(latestResults, latestConfig, "download");

    // Find the latest Excel file by modification time (not alphabetically)
    const files = fs.readdirSync(resultsDir).filter((f) => f.endsWith(".xlsx"));
    if (files.length === 0) {
      return res.status(404).json({ error: "Excel file not found" });
    }

    // Sort by modification time (newest first)
    const latestFile = files
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(resultsDir, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime)[0].name;
    const filePath = path.join(resultsDir, latestFile);

    res.download(filePath, `Compilation_Grades.xlsx`);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to download Excel file" });
  }
});

// Download error log
app.get("/api/download-error-log", async (req, res) => {
  try {
    const files = fs.readdirSync(resultsDir).filter((f) => f.endsWith(".txt"));
    if (files.length === 0) {
      return res.status(404).json({ error: "Error log not found" });
    }

    // Sort by modification time (newest first)
    const latestFile = files
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(resultsDir, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime)[0].name;
    const filePath = path.join(resultsDir, latestFile);

    res.download(filePath, `Error_Log.txt`);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to download error log" });
  }
});

// =============================================================================
// Helper Functions
// =============================================================================

async function generateExcelFile(results, config, sessionId) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "C Autograder";
  workbook.created = new Date();

  // Main grades sheet
  const sheet = workbook.addWorksheet("Grades", {
    properties: { tabColor: { argb: "3B82F6" } },
  });

  // Headers
  const headers = ["Student Name"];
  for (let i = 1; i <= config.totalQuestions; i++) {
    headers.push(`Q${i}`);
  }
  headers.push("Total Score");

  // Style header row
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "3B82F6" },
  };
  headerRow.alignment = { horizontal: "center" };

  // Add student data
  results.students.forEach((student, index) => {
    const row = [student.name, ...student.questions, student.total];
    const dataRow = sheet.addRow(row);

    // Alternate row colors
    if (index % 2 === 1) {
      dataRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F1F5F9" },
      };
    }

    // Color code total score
    const totalCell = dataRow.getCell(headers.length);
    const totalMarks = config.totalQuestions * config.marksPerQuestion;
    if (student.total === totalMarks) {
      totalCell.font = { bold: true, color: { argb: "10B981" } };
    } else if (student.total < totalMarks * 0.5) {
      totalCell.font = { bold: true, color: { argb: "EF4444" } };
    }
  });

  // Auto-fit columns
  sheet.columns.forEach((column, i) => {
    column.width = i === 0 ? 25 : 12;
  });

  // Summary sheet
  const summarySheet = workbook.addWorksheet("Summary", {
    properties: { tabColor: { argb: "10B981" } },
  });

  summarySheet.addRow(["Grading Summary"]);
  summarySheet.getRow(1).font = { bold: true, size: 14 };
  summarySheet.addRow([]);
  summarySheet.addRow(["Course", config.courseName]);
  summarySheet.addRow(["Section", config.sectionName]);
  summarySheet.addRow(["Assignment", config.assignmentName]);
  summarySheet.addRow([]);
  summarySheet.addRow(["Total Students", results.totalStudents]);
  summarySheet.addRow(["Average Score", results.averageScore.toFixed(2)]);
  summarySheet.addRow(["Highest Score", results.highestScore]);
  summarySheet.addRow(["Lowest Score", results.lowestScore]);
  summarySheet.addRow(["Perfect Scores", results.perfectScores]);
  summarySheet.addRow(["Students with Errors", results.studentsWithErrors]);

  // Save file
  const filename = `Grades_${sessionId}_${Date.now()}.xlsx`;
  const filepath = path.join(resultsDir, filename);
  await workbook.xlsx.writeFile(filepath);

  console.log(`📊 Excel file generated: ${filename}`);
  return filepath;
}

async function generateErrorLogFile(results, config, sessionId) {
  const totalMarks = config.totalQuestions * config.marksPerQuestion;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  let content = "";
  content += "=".repeat(100) + "\n";
  content += `${config.courseName} ${config.sectionName} - ${config.assignmentName} - COMPILATION ERROR LOG\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Grading: ${config.totalQuestions} questions × ${config.marksPerQuestion} marks = ${totalMarks} total\n`;
  content += "=".repeat(100) + "\n\n";

  // Compilation errors section
  content += "=".repeat(100) + "\n";
  content += "SECTION 1: COMPILATION ERRORS\n";
  content += "=".repeat(100) + "\n";

  if (results.errorLog && results.errorLog.length > 0) {
    // Group errors by student
    const errorsByStudent = {};
    results.errorLog.forEach((err) => {
      if (!errorsByStudent[err.student]) {
        errorsByStudent[err.student] = [];
      }
      errorsByStudent[err.student].push(err);
    });

    Object.keys(errorsByStudent)
      .sort()
      .forEach((student) => {
        const errors = errorsByStudent[student];
        const studentData = results.students.find((s) => s.name === student);
        const total = studentData ? studentData.total : 0;

        content += `\n${"─".repeat(100)}\n`;
        content += `STUDENT: ${student} (Score: ${total}/${totalMarks})\n`;
        content += `${"─".repeat(100)}\n`;

        errors.forEach((err) => {
          content += `\n📌 Question ${err.question}:\n`;
          content += `   File: ${err.filename}\n`;
          content += "-".repeat(60) + "\n";
          content += `${err.message}\n`;
        });
      });
  } else {
    content +=
      "\n🎉 No compilation errors! All submitted files compiled successfully.\n";
  }

  // Summary section
  content += "\n\n" + "=".repeat(100) + "\n";
  content += "SECTION 2: STATISTICS SUMMARY\n";
  content += "=".repeat(100) + "\n\n";
  content += `Total Students: ${results.totalStudents}\n`;
  content += `Average Score: ${results.averageScore.toFixed(
    2
  )}/${totalMarks}\n`;
  content += `Highest Score: ${results.highestScore}/${totalMarks}\n`;
  content += `Lowest Score: ${results.lowestScore}/${totalMarks}\n`;
  content += `Perfect Scores: ${results.perfectScores}\n`;
  content += `Students with Errors: ${results.studentsWithErrors}\n`;

  // Save file
  const filename = `Error_Log_${sessionId}_${timestamp}.txt`;
  const filepath = path.join(resultsDir, filename);
  fs.writeFileSync(filepath, content, "utf-8");

  console.log(`📝 Error log generated: ${filename}`);
  return filepath;
}

// =============================================================================
// Start Server
// =============================================================================

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🎓 C Autograder Server                                  ║
  ║                                                           ║
  ║   Server running on: http://localhost:${PORT}               ║
  ║   Python API URL: ${PYTHON_API_URL}                    ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});
