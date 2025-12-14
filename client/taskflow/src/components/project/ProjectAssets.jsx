import { useState } from "react";
import Avatar from "../common/Avatar";
import {
    FaSpinner,
    FaFileAlt,
    FaDownload,
    FaImage,
    FaTrash,
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaFileArchive,
    FaCloudUploadAlt,
} from "react-icons/fa";
import { useUser } from "../../contexts/UserContext";
import UploadModal from "../modals/UploadModal";
import DeleteModal from "../modals/DeleteModal";
import { useApi } from "../hooks/useApi";
import { toast } from "react-toastify";

const ProjectAssets = ({ assets, assetsLoading, projectId, onAssetsUpdated, isProjectAdmin }) => {
    const { currentUser } = useUser();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // Delete state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAsset, setDeletingAsset] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { makeRequest, loading: uploading } = useApi();

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (e.g., 10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setUploadError("File size exceeds 10MB limit.");
                return;
            }
            setSelectedFile(file);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("project", projectId);

        try {
            await makeRequest(
                `/api/projects/${projectId}/assets/`,
                "POST",
                formData
            );
            toast.success("Asset uploaded successfully");
            onAssetsUpdated();
            handleCloseModal();
        } catch (err) {
            console.error("Upload failed:", err);
            setUploadError(err.message || "Failed to upload file");
            toast.error("Failed to upload asset");
        }
    };

    const handleCloseModal = () => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadError(null);
    };

    // Delete handlers
    const openDeleteModal = (asset) => {
        setDeletingAsset(asset);
        setShowDeleteModal(true);
    };

    const confirmDeleteAsset = async () => {
        if (!deletingAsset) return;

        setIsDeleting(true);
        try {
            await makeRequest(`/api/assets/${deletingAsset.id}/`, "DELETE");
            setShowDeleteModal(false);
            setDeletingAsset(null);
            onAssetsUpdated();
            toast.success("Asset deleted successfully");
        } catch (err) {
            toast.error("Failed to delete asset: " + (err.message || "Unknown error"));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Project Assets
                </h2>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                >
                    <FaCloudUploadAlt /> Upload Asset
                </button>
            </div>

            {assetsLoading ? (
                <div className="p-12 text-center">
                    <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Loading assets...</p>
                </div>
            ) : assets && assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 p-6">
                    {assets.map((asset) => {
                        const fileName = asset.file.split('/').pop();
                        const fileExtension = fileName.split('.').pop().toLowerCase();

                        const getFileIcon = () => {
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
                                return <FaImage className="text-blue-500" />;
                            } else if (fileExtension === 'pdf') {
                                return <FaFilePdf className="text-red-500" />;
                            } else if (['doc', 'docx'].includes(fileExtension)) {
                                return <FaFileWord className="text-blue-600" />;
                            } else if (['xls', 'xlsx'].includes(fileExtension)) {
                                return <FaFileExcel className="text-green-600" />;
                            } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension)) {
                                return <FaFileArchive className="text-yellow-600" />;
                            }
                            return <FaFileAlt className="text-gray-500" />;
                        };

                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
                        const canDelete = isProjectAdmin || currentUser.id === asset.uploaded_by.id;

                        return (
                            <div
                                key={asset.id}
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group relative"
                            >
                                {/* File Preview/Icon */}
                                <div className="bg-gray-50 h-32 flex items-center justify-center relative overflow-hidden">
                                    {isImage ? (
                                        <img
                                            src={asset.file}
                                            alt={fileName}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110">
                                            {getFileIcon()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>

                                {/* File Info */}
                                <div className="p-3">
                                    <h3 className="font-medium text-gray-900 text-xs truncate mb-2" title={fileName}>
                                        {fileName}
                                    </h3>

                                    {/* Uploader Info */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar
                                            name={asset.uploaded_by.display_name}
                                            url={asset.uploaded_by.avatar}
                                            size={6}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-600 truncate">
                                                {asset.uploaded_by.display_name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatDate(asset.uploaded_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <a
                                            href={asset.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 transition-colors font-medium"
                                        >
                                            <FaDownload size={12} />
                                            <span>Download</span>
                                        </a>

                                        {canDelete && (
                                            <button
                                                onClick={() => openDeleteModal(asset)}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 transition-colors font-medium"
                                            >
                                                <FaTrash size={12} />
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-12 text-center">
                    <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No Assets Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Upload files to share with your project team
                    </p>
                </div>
            )}

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

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteAsset}
                title="Delete Asset"
                message={deletingAsset ? `Are you sure you want to delete ${deletingAsset.file.split('/').pop()}?` : "Are you sure?"}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProjectAssets;
