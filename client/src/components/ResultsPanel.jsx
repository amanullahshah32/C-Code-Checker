import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function ResultsPanel({
  results,
  errorLog,
  config,
  onDownloadExcel,
  onDownloadErrorLog,
}) {
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const totalMarks = config.totalQuestions * config.marksPerQuestion;

  // Sort students
  const sortedStudents = [...results.students].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === "total") {
      return sortDirection === "asc" ? a.total - b.total : b.total - a.total;
    }
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="glass rounded-xl p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-white">
                {results.totalStudents}
              </p>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="glass rounded-xl p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-white">
                {results.averageScore.toFixed(2)}
                <span className="text-sm text-gray-500 ml-1">
                  / {totalMarks}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Perfect Scores */}
        <div className="glass rounded-xl p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Perfect Scores</p>
              <p className="text-2xl font-bold text-white">
                {results.perfectScores}
              </p>
            </div>
          </div>
        </div>

        {/* Compilation Errors */}
        <div className="glass rounded-xl p-4 card-hover">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">With Errors</p>
              <p className="text-2xl font-bold text-white">
                {results.studentsWithErrors}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onDownloadExcel}
          className="btn-primary px-6 py-3 rounded-xl text-white font-medium
                   flex items-center gap-2"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Download Excel Grades
        </button>

        <button
          onClick={onDownloadErrorLog}
          className="px-6 py-3 rounded-xl font-medium flex items-center gap-2
                   bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <FileText className="w-5 h-5" />
          Download Error Log
        </button>
      </div>

      {/* Grade Distribution */}
      <div className="glass rounded-2xl p-6 card-hover">
        <h3 className="text-lg font-semibold text-white mb-4">
          Grade Distribution
        </h3>
        <div className="space-y-2">
          {results.distribution.map((item) => (
            <div key={item.score} className="flex items-center gap-3">
              <span className="text-gray-400 w-16 text-right">
                {item.score}
              </span>
              <div className="flex-1 h-6 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full
                           transition-all duration-500"
                  style={{
                    width: `${(item.count / results.totalStudents) * 100}%`,
                  }}
                />
              </div>
              <span className="text-white font-medium w-8">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="glass rounded-2xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Detailed Results</h3>
          <button
            onClick={() => setShowDetailedResults(!showDetailedResults)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
          >
            {showDetailedResults ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Details
              </>
            )}
          </button>
        </div>

        {showDetailedResults && (
          <div className="overflow-x-auto">
            <table className="w-full results-table">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th
                    className="p-3 text-gray-400 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("name")}
                  >
                    Student Name
                    {sortField === "name" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  {Array.from({ length: config.totalQuestions }, (_, i) => (
                    <th
                      key={i}
                      className="p-3 text-gray-400 font-medium text-center"
                    >
                      Q{i + 1}
                    </th>
                  ))}
                  <th
                    className="p-3 text-gray-400 font-medium text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort("total")}
                  >
                    Total
                    {sortField === "total" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => (
                  <tr
                    key={student.name}
                    className="border-b border-gray-700/50 hover:bg-white/5"
                  >
                    <td className="p-3 text-white font-medium">
                      {student.name}
                    </td>
                    {student.questions.map((q, qIndex) => (
                      <td key={qIndex} className="p-3 text-center">
                        {q > 0 ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            {q}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <XCircle className="w-4 h-4" />0
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      <span
                        className={`font-bold ${
                          student.total === totalMarks
                            ? "text-green-400"
                            : student.total >= totalMarks * 0.6
                            ? "text-blue-400"
                            : "text-orange-400"
                        }`}
                      >
                        {student.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compilation Errors Summary */}
      {errorLog && errorLog.length > 0 && (
        <div className="glass rounded-2xl p-6 card-hover">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Compilation Errors Summary
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errorLog.slice(0, 10).map((error, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">
                    {error.student}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-sm">
                    Q{error.question}
                  </span>
                </div>
                <p className="text-red-300 text-sm font-mono truncate">
                  {error.message}
                </p>
              </div>
            ))}
            {errorLog.length > 10 && (
              <p className="text-gray-500 text-sm text-center">
                ... and {errorLog.length - 10} more errors. Download the error
                log for full details.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsPanel;
