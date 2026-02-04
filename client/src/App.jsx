import { useState } from "react";
import Header from "./components/Header";
import FileUploader from "./components/FileUploader";
import ConfigPanel from "./components/ConfigPanel";
import GradingProgress from "./components/GradingProgress";
import ResultsPanel from "./components/ResultsPanel";
import toast from "react-hot-toast";
import axios from "axios";

function App() {
  // File upload state
  const [files, setFiles] = useState([]);

  // Configuration state
  const [config, setConfig] = useState({
    totalQuestions: 6,
    marksPerQuestion: 2.5,
    compilationTimeout: 60,
    courseName: "CSE115",
    sectionName: "Section 10",
    assignmentName: "Assignment 2",
  });

  // Grading state
  const [isGrading, setIsGrading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  // Results state
  const [results, setResults] = useState(null);
  const [errorLog, setErrorLog] = useState(null);

  // Handle file selection
  const handleFilesSelected = (newFiles) => {
    setFiles((prevFiles) => {
      const existingNames = new Set(prevFiles.map((f) => f.name));
      const uniqueNewFiles = newFiles.filter((f) => !existingNames.has(f.name));
      return [...prevFiles, ...uniqueNewFiles];
    });
    toast.success(`Added ${newFiles.length} file(s)`);
  };

  // Remove a file
  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== fileName));
  };

  // Clear all files
  const handleClearFiles = () => {
    setFiles([]);
    setResults(null);
    setErrorLog(null);
    toast.success("All files cleared");
  };

  // Update configuration
  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Start grading process
  const handleStartGrading = async () => {
    if (files.length === 0) {
      toast.error("Please upload some C files first!");
      return;
    }

    setIsGrading(true);
    setProgress(0);
    setProgressMessage("Preparing files...");
    setResults(null);
    setErrorLog(null);

    try {
      // Create FormData with files and config
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("config", JSON.stringify(config));

      setProgress(10);
      setProgressMessage("Uploading files to server...");

      // Send to backend
      const response = await axios.post("/api/grade", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 30) / progressEvent.total
          );
          setProgress(10 + percentCompleted);
        },
      });

      setProgress(50);
      setProgressMessage("Compiling and grading...");

      // Simulate gradual progress while waiting for results
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      // Wait a bit for the grading to complete (the response should have results)
      clearInterval(progressInterval);

      setProgress(100);
      setProgressMessage("Grading complete!");

      if (response.data.success) {
        setResults(response.data.results);
        setErrorLog(response.data.errorLog);
        toast.success(
          `Graded ${response.data.results.totalStudents} students!`
        );
      } else {
        throw new Error(response.data.error || "Grading failed");
      }
    } catch (error) {
      console.error("Grading error:", error);
      toast.error(
        error.response?.data?.error || error.message || "Grading failed"
      );
    } finally {
      setIsGrading(false);
    }
  };

  // Download Excel file
  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get("/api/download-excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${config.courseName}_${config.sectionName}_${config.assignmentName}_Grades.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel file downloaded!");
    } catch (error) {
      toast.error("Failed to download Excel file");
    }
  };

  // Download error log
  const handleDownloadErrorLog = async () => {
    try {
      const response = await axios.get("/api/download-error-log", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${config.courseName}_${config.sectionName}_Error_Log.txt`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Error log downloaded!");
    } catch (error) {
      toast.error("Failed to download error log");
    }
  };

  return (
    <div className="min-h-screen">
      <Header config={config} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Section: File Upload and Config */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* File Uploader - Takes 2 columns */}
          <div className="lg:col-span-2">
            <FileUploader
              files={files}
              onFilesSelected={handleFilesSelected}
              onRemoveFile={handleRemoveFile}
              onClearFiles={handleClearFiles}
              disabled={isGrading}
            />
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <ConfigPanel
              config={config}
              onConfigChange={handleConfigChange}
              disabled={isGrading}
            />
          </div>
        </div>

        {/* Start Grading Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleStartGrading}
            disabled={isGrading || files.length === 0}
            className="btn-primary px-12 py-4 rounded-xl text-white font-semibold text-lg
                       flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGrading ? (
              <>
                <div className="spinner w-6 h-6"></div>
                Grading in Progress...
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Start Grading ({files.length} files)
              </>
            )}
          </button>
        </div>

        {/* Progress Bar (shown while grading) */}
        {isGrading && (
          <GradingProgress progress={progress} message={progressMessage} />
        )}

        {/* Results Panel (shown after grading) */}
        {results && (
          <ResultsPanel
            results={results}
            errorLog={errorLog}
            config={config}
            onDownloadExcel={handleDownloadExcel}
            onDownloadErrorLog={handleDownloadErrorLog}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>C Programming Autograder • Built for Educators</p>
      </footer>
    </div>
  );
}

export default App;
