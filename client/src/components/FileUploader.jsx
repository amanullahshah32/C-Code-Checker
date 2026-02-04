import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCode, X, Trash2, FolderOpen } from "lucide-react";

function FileUploader({
  files,
  onFilesSelected,
  onRemoveFile,
  onClearFiles,
  disabled,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Filter for .c files
      const cFiles = acceptedFiles.filter((file) =>
        file.name.toLowerCase().endsWith(".c")
      );

      if (cFiles.length > 0) {
        onFilesSelected(cFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "text/x-c": [".c"],
      "text/plain": [".c"],
    },
    disabled,
    noClick: false,
    noKeyboard: false,
  });

  // Handle folder selection
  const handleFolderSelect = (e) => {
    const fileList = e.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList).filter((file) =>
        file.name.toLowerCase().endsWith(".c")
      );
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
    }
  };

  return (
    <div className="glass rounded-2xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-400" />
          Upload C Files
        </h2>
        {files.length > 0 && (
          <button
            onClick={onClearFiles}
            disabled={disabled}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                   transition-all duration-300 mb-4
                   ${
                     isDragActive
                       ? "border-blue-400 bg-blue-500/10"
                       : "border-gray-600 hover:border-gray-500 hover:bg-white/5"
                   }
                   ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                        ${
                          isDragActive
                            ? "bg-blue-500/20 pulse-ring"
                            : "bg-gray-700/50"
                        }`}
        >
          <Upload
            className={`w-8 h-8 ${
              isDragActive ? "text-blue-400" : "text-gray-400"
            }`}
          />
        </div>

        {isDragActive ? (
          <p className="text-blue-400 font-medium">Drop the files here...</p>
        ) : (
          <>
            <p className="text-gray-300 font-medium mb-2">
              Drag & drop C files here
            </p>
            <p className="text-gray-500 text-sm">or click to browse files</p>
          </>
        )}
      </div>

      {/* Folder Upload Button */}
      <div className="flex justify-center mb-4">
        <label className="cursor-pointer">
          <input
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderSelect}
            disabled={disabled}
            className="hidden"
          />
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg
                          bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 
                          transition-colors text-sm
                          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <FolderOpen className="w-4 h-4" />
            Upload Entire Folder
          </span>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </span>
            <span className="text-gray-500 text-xs">
              {(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB
              total
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-lg bg-gray-800/50 p-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="file-item flex items-center justify-between p-2 rounded-lg
                         hover:bg-gray-700/50 group transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.name);
                  }}
                  disabled={disabled}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md
                           hover:bg-red-500/20 text-gray-500 hover:text-red-400
                           transition-all disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-gray-500 text-xs mt-4 text-center">
        Supported format: .c files • Filename format: studentname_id_questionX.c
      </p>
    </div>
  );
}

export default FileUploader;
