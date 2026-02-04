import { Code2, GraduationCap } from "lucide-react";

function Header({ config }) {
  return (
    <header className="glass border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                          flex items-center justify-center shadow-lg"
            >
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">C Autograder</h1>
              <p className="text-gray-400 text-sm">
                Automated Assignment Grading System
              </p>
            </div>
          </div>

          {/* Course Info Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">
                {config.courseName}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300">{config.sectionName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
