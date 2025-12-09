import { useRef } from "react";
import { IoCloudUploadOutline, IoCloseOutline } from "react-icons/io5";

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

  return (
    <div className="fixed inset-0 bg-black/50 transition-opacity duration-200 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload Asset</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoCloseOutline className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* File input area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <IoCloudUploadOutline className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {selectedFile ? selectedFile.name : "Click to select a file"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
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
            <p className="text-red-600 text-sm">{uploadError}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;