import { useRef } from "react";
import { IoCloudUploadOutline, IoCloseOutline } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { createPortal } from "react-dom";

const UploadModal = ({
  showUploadModal,
  setShowUploadModal,
  handleUpload,
  handleFileSelect,
  selectedFile,
  setSelectedFile,
  uploadError,
  setUploadError,
  uploading
}) => {
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadError(null);
  };

  if (!showUploadModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm p-6 w-full max-w-md shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Upload Asset</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-300 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <IoCloseOutline className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* File input area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-200 dark:border-slate-800 rounded-sm p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500/80 hover:bg-slate-50/30 dark:hover:bg-slate-955/30 transition-all duration-150"
          >
            <IoCloudUploadOutline className="w-10 h-10 mx-auto text-gray-400 dark:text-slate-500 mb-2" />
            <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
              {selectedFile ? selectedFile.name : "Click to select a file"}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-semibold">
              {selectedFile
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : "All file types supported"
              }
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadError && (
            <p className="text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">{uploadError}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-755 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-sm border border-transparent shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {uploading ? (
                <>
                  <ClipLoader color="#fff" size={12} />
                  <span>Uploading...</span>
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UploadModal;