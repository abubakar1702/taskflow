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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { toast } from "react-toastify";

const ProjectAssets = ({ assets, assetsLoading, projectId, onAssetsUpdated, isProjectAdmin }) => {
    const queryClient = useQueryClient();
    const { currentUser } = useUser();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // Delete state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAsset, setDeletingAsset] = useState(null);

    const { mutate: uploadAsset, isPending: uploading } = useMutation({
        mutationFn: async (formData) => {
            const response = await apiClient.post(`/api/projects/${projectId}/assets/`, formData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Asset uploaded successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(projectId) });
            onAssetsUpdated();
            handleCloseModal();
        },
        onError: (err) => {
            console.error("Upload failed:", err);
            setUploadError(err.response?.data?.detail || err.message || "Failed to upload file");
            toast.error("Failed to upload asset");
        }
    });

    const { mutate: deleteAsset, isPending: isDeleting } = useMutation({
        mutationFn: async (assetId) => {
            await apiClient.delete(`/api/assets/${assetId}/`);
        },
        onSuccess: () => {
            toast.success("Asset deleted successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(projectId) });
            onAssetsUpdated();
            setShowDeleteModal(false);
            setDeletingAsset(null);
        },
        onError: (err) => {
            toast.error("Failed to delete asset: " + (err.response?.data?.detail || err.message || "Unknown error"));
        }
    });

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

    const handleUpload = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("project", projectId);

        uploadAsset(formData);
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

    const confirmDeleteAsset = () => {
        if (!deletingAsset) return;
        deleteAsset(deletingAsset.id);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-sm shadow-none border border-gray-200 dark:border-slate-800/80">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                    Project Assets
                </h2>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
                >
                    <FaCloudUploadAlt className="w-3.5 h-3.5" /> Upload Asset
                </button>
            </div>

            {assetsLoading ? (
                <div className="p-12 text-center">
                    <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-slate-400">Loading assets...</p>
                </div>
            ) : assets && assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
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
                                className="border border-gray-200 dark:border-slate-800 rounded-sm overflow-hidden hover:border-gray-300 dark:hover:border-slate-700 transition-colors group relative shadow-none"
                            >
                                {/* File Preview/Icon */}
                                <div className="bg-gray-50 dark:bg-slate-800/50 h-32 flex items-center justify-center relative overflow-hidden">
                                    {isImage ? (
                                        <img
                                            src={asset.file}
                                            alt={fileName}
                                            className="w-full h-full object-cover transition-transform duration-355 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="text-4xl transform transition-transform duration-355 group-hover:scale-110">
                                            {getFileIcon()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                </div>

                                {/* File Info */}
                                <div className="p-3">
                                    <h3 className="font-bold text-gray-900 dark:text-slate-100 text-xs truncate mb-2" title={fileName}>
                                        {fileName}
                                    </h3>

                                    {/* Uploader Info */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Avatar
                                            name={asset.uploaded_by.display_name}
                                            url={asset.uploaded_by.avatar}
                                            size={6}
                                            className="rounded-sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-gray-700 dark:text-slate-300 truncate">
                                                {asset.uploaded_by.display_name}
                                            </p>
                                            <p className="text-[9px] text-gray-400 dark:text-slate-500">
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
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-xs rounded-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-semibold border border-transparent hover:border-blue-100 dark:hover:border-blue-900"
                                        >
                                            <FaDownload size={11} />
                                            <span>Download</span>
                                        </a>

                                        {canDelete && (
                                            <button
                                                onClick={() => openDeleteModal(asset)}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs rounded-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-semibold border border-transparent hover:border-red-100 dark:hover:border-red-900"
                                            >
                                                <FaTrash size={11} />
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
                    <FaFileAlt className="text-4xl text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 uppercase tracking-wider mb-2">
                        No Assets Yet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
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
