import { Settings, BookOpen, Clock, Hash, Award } from "lucide-react";

function ConfigPanel({ config, onConfigChange, disabled }) {
  return (
    <div className="glass rounded-2xl p-6 card-hover h-full">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-purple-400" />
        Configuration
      </h2>

      <div className="space-y-4">
        {/* Course Name */}
        <div>
          <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <BookOpen className="w-4 h-4" />
            Course Name
          </label>
          <input
            type="text"
            value={config.courseName}
            onChange={(e) => onConfigChange("courseName", e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700
                     text-white placeholder-gray-500 disabled:opacity-50"
            placeholder="e.g., CSE115"
          />
        </div>

        {/* Section Name */}
        <div>
          <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Hash className="w-4 h-4" />
            Section
          </label>
          <input
            type="text"
            value={config.sectionName}
            onChange={(e) => onConfigChange("sectionName", e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700
                     text-white placeholder-gray-500 disabled:opacity-50"
            placeholder="e.g., Section 10"
          />
        </div>

        {/* Assignment Name */}
        <div>
          <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <BookOpen className="w-4 h-4" />
            Assignment Name
          </label>
          <input
            type="text"
            value={config.assignmentName}
            onChange={(e) => onConfigChange("assignmentName", e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700
                     text-white placeholder-gray-500 disabled:opacity-50"
            placeholder="e.g., Assignment 2"
          />
        </div>

        {/* Divider */}
        <hr className="border-gray-700 my-4" />

        {/* Total Questions */}
        <div>
          <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Hash className="w-4 h-4" />
            Total Questions
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={config.totalQuestions}
            onChange={(e) =>
              onConfigChange("totalQuestions", parseInt(e.target.value) || 1)
            }
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700
                     text-white disabled:opacity-50"
          />
        </div>

        {/* Marks Per Question */}
        <div>
          <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Award className="w-4 h-4" />
            Marks Per Question
          </label>
          <input
            type="number"
            min="0.5"
            max="100"
            step="0.5"
            value={config.marksPerQuestion}
            onChange={(e) =>
              onConfigChange(
                "marksPerQuestion",
                parseFloat(e.target.value) || 0.5
              )
            }
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700
                     text-white disabled:opacity-50"
          />
        </div>

        {/* Compilation Timeout */}
        <div>
          <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Clock className="w-4 h-4" />
            Compilation Timeout (seconds)
          </label>
          <input
            type="number"
            min="5"
            max="300"
            value={config.compilationTimeout}
            onChange={(e) =>
              onConfigChange(
                "compilationTimeout",
                parseInt(e.target.value) || 30
              )
            }
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700
                     text-white disabled:opacity-50"
          />
        </div>

        {/* Total Marks Display */}
        <div
          className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                       border border-blue-500/30"
        >
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Total Marks</p>
            <p className="text-3xl font-bold gradient-text">
              {(config.totalQuestions * config.marksPerQuestion).toFixed(1)}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {config.totalQuestions} × {config.marksPerQuestion} marks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigPanel;
