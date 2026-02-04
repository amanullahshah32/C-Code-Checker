import { Loader } from "lucide-react";

function GradingProgress({ progress, message }) {
  return (
    <div className="glass rounded-2xl p-6 mb-8 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Loader className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-white font-medium">Grading in Progress</span>
        </div>
        <span className="text-blue-400 font-bold">{Math.round(progress)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full progress-bar rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Message */}
      <p className="text-gray-400 text-sm mt-3 text-center">{message}</p>

      {/* Animation Dots */}
      <div className="flex justify-center gap-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default GradingProgress;
