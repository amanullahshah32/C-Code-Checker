# 🎓 C Programming Autograder

A modern, full-stack web application for automatically grading C programming assignments. Upload student submissions, configure grading parameters, and download Excel grade reports.

![Autograder Screenshot](screenshot.png)

## ✨ Features

- **📁 File Upload**: Drag & drop C files or upload entire folders
- **⚙️ Configurable**: Set questions, marks, timeout, course info
- **🔄 Auto-Parsing**: Intelligent filename parsing for various naming conventions
- **📊 Excel Export**: Download formatted grade spreadsheets
- **📝 Error Log**: Detailed compilation error reports
- **🎨 Modern UI**: Beautiful, responsive dark-themed interface

## 🏗️ Architecture

```
autograder-app/
├── client/          # React + Vite frontend
├── server/          # Express.js backend
└── python/          # Flask API for grading logic
```

## 📋 Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Python** (3.8 or higher) - [Download](https://python.org/)
3. **GCC Compiler** - Required for compiling C files
   - Windows: Install [MinGW-w64](https://www.mingw-w64.org/) or use [MSYS2](https://www.msys2.org/)
   - Make sure `gcc` is in your PATH

## 🚀 Quick Start

### Option 1: Using the Start Script (Recommended)

**Windows:**

```powershell
# Run the start script
.\start.ps1
```

**Manual Start:**

```powershell
# Install all dependencies
npm run install:all

# Start all services
npm run dev
```

### Option 2: Start Each Service Separately

**Terminal 1 - Python API (Port 8000):**

```bash
cd python
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Express Server (Port 5000):**

```bash
cd server
npm install
npm run dev
```

**Terminal 3 - React Frontend (Port 3000):**

```bash
cd client
npm install
npm run dev
```

## 🌐 Accessing the Application

Once all services are running:

1. Open your browser
2. Go to **http://localhost:3000**
3. Upload your C files
4. Configure grading settings
5. Click "Start Grading"
6. Download your Excel results!

## 📁 File Naming Conventions

The autograder supports various filename formats:

| Format            | Example                        |
| ----------------- | ------------------------------ |
| Standard          | `johnsmith_12345_question1.c`  |
| With sub-parts    | `johnsmith_12345_question3a.c` |
| Q format          | `johnsmith_12345_q1.c`         |
| Assignment format | `johnsmith_12345_A-2-1.c`      |
| Problem format    | `johnsmith_12345_problem-1.c`  |

**Expected pattern:** `studentname_id_questioninfo.c`

## ⚙️ Configuration Options

| Setting            | Description                   | Default      |
| ------------------ | ----------------------------- | ------------ |
| Course Name        | Name of the course            | CSE115       |
| Section            | Section identifier            | Section 10   |
| Assignment         | Assignment name               | Assignment 2 |
| Total Questions    | Number of questions           | 6            |
| Marks per Question | Points per question           | 2.5          |
| Timeout            | Compilation timeout (seconds) | 60           |

## 📊 Output Files

1. **Excel Grades File** (`Compilation_Grades.xlsx`)

   - Student names
   - Score for each question (0 or marks if compiled)
   - Total score
   - Summary statistics sheet

2. **Error Log** (`Error_Log.txt`)
   - Detailed compilation errors
   - Student-by-student breakdown
   - Statistics summary

## 🔧 API Endpoints

### Express Server (Port 5000)

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/health`             | Health check             |
| POST   | `/api/grade`              | Submit files for grading |
| GET    | `/api/download-excel`     | Download grades Excel    |
| GET    | `/api/download-error-log` | Download error log       |

### Python API (Port 8000)

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| GET    | `/health`     | Health check          |
| POST   | `/grade`      | Grade submissions     |
| POST   | `/test-parse` | Test filename parsing |

## 🛠️ Development

### Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── FileUploader.jsx
│   │   ├── ConfigPanel.jsx
│   │   ├── GradingProgress.jsx
│   │   └── ResultsPanel.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js

server/
├── index.js
└── package.json

python/
├── app.py
└── requirements.txt
```

### Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Axios
- **Backend**: Express.js, Multer, ExcelJS
- **Grading API**: Flask, Python subprocess

## 🏷️ Version Control

### When You Make Version 2 Later:

```powershell
# After making changes...
git add .
git commit -m "Version 2.0 - Added new feature XYZ"
git push origin main

# Create version 2 tag
git tag -a v2.0 -m "Version 2.0 - Description"
git push origin v2.0
```

### Switching Between Versions:

```powershell
git checkout v1.0   # Go to Version 1
git checkout v2.0   # Go to Version 2
git checkout main   # Go to latest code
```

## 📝 License

MIT License - Feel free to use and modify!

## 🙏 Acknowledgments

Built for educators to make C programming assignment grading easier and more efficient.

---

Made with ❤️ for the teaching community
