import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { IoCloudUploadOutline, IoTrashOutline } from "react-icons/io5";
import UploadModal from "../modals/UploadModal";

const AssetSection = ({ taskId, projectId }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const endpoint = taskId
    ? `/api/tasks/${taskId}/assets/`
    : projectId
      ? `/api/projects/${projectId}/assets/`
      : null;

  const { data, loading, error, refetch, makeRequest } = useApi(endpoint, "GET", null, [taskId, projectId]);

  const assets = data || [];

  const handleUploadClick = () => {
    setShowUploadModal(true);
    setUploadError(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      if (taskId) {
        formData.append("task", taskId);
      } else if (projectId) {
        formData.append("project", projectId);
      }

      await makeRequest(endpoint, "POST", formData);
      
      setShowUploadModal(false);
      setSelectedFile(null);
      refetch();
    } catch (err) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      await makeRequest(`/api/assets/${assetId}/`, "DELETE");
      refetch();
    } catch (err) {
      alert("Failed to delete asset: " + (err.message || "Unknown error"));
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const isImage = (filename) => {
    const ext = getFileExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <p>Loading assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow text-red-600">
        <p>Error: {error.message || "Failed to load assets"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Assets</h2>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <IoCloudUploadOutline className="w-5 h-5" />
            <span className="text-sm font-medium">Upload</span>
          </button>
        </div>

        {assets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No assets found</p>
        ) : (
          <ul className="space-y-3">
            {assets.map((asset) => (
              <li key={asset.id} className="p-3 bg-gray-50 rounded flex items-center space-x-4 group">
                {/* File preview */}
                {isImage(asset.file) ? (
                  <img 
                    src={asset.file} 
                    alt="Asset" 
                    className="w-16 h-16 object-cover rounded border border-gray-200" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs uppercase">
                      {getFileExtension(asset.file)}
                    </span>
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <a
                    href={asset.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium truncate block"
                  >
                    {asset.file.split('/').pop()}
                  </a>
                  <p className="text-sm text-gray-600">
                    Uploaded by: {asset.uploaded_by?.display_name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(asset.uploaded_at).toLocaleString()}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete asset"
                >
                  <IoTrashOutline className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <UploadModal
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        handleUpload={handleUpload}
        handleFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        uploadError={uploadError}
        setUploadError={setUploadError}
        uploading={uploading}
      />
    </>
  );
};

export default AssetSection;