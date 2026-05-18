import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { IoCloudUploadOutline, IoTrashOutline } from "react-icons/io5";
import UploadModal from "../../components/modals/UploadModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";

const AssetSection = ({ task, taskId, projectId, total_assets }) => {
  const queryClient = useQueryClient();
  const { canUpload, currentUser } = useTaskPermissions(task);
  const canDelete = task?.creator?.id === currentUser.id || task?.uploaded_by?.id === currentUser.id;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState(null);

  const endpoint = taskId
    ? `/api/tasks/${taskId}/assets/`
    : projectId
      ? `/api/projects/${projectId}/assets/`
      : null;

  const assetQueryKey = ['assets', taskId || projectId];

  const { data, isLoading: loading, error } = useQuery({
    queryKey: assetQueryKey,
    queryFn: async () => (await apiClient.get(endpoint)).data,
    enabled: !!endpoint,
  });
  const assets = Array.isArray(data) ? data : (data?.results || []);

  const { mutate: uploadAsset, isPending: uploading } = useMutation({
    mutationFn: (formData) => apiClient.post(endpoint, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKey });
      setShowUploadModal(false);
      setSelectedFile(null);
      toast.success("Asset uploaded successfully");
    },
    onError: (err) => toast.error("Failed to upload asset: " + (err.message || "Unknown error")),
  });

  const { mutate: deleteAsset, isPending: isDeleting } = useMutation({
    mutationFn: (assetId) => apiClient.delete(`/api/assets/${assetId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetQueryKey });
      setShowDeleteModal(false);
      setDeletingAsset(null);
      toast.success("Asset deleted successfully");
    },
    onError: (err) => toast.error("Failed to delete asset: " + (err.message || "Unknown error")),
  });

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

  const handleUpload = () => {
    if (!selectedFile) {
      setUploadError("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (taskId) formData.append("task", taskId);
    else if (projectId) formData.append("project", projectId);
    uploadAsset(formData);
  };

  const openDeleteModal = (asset) => {
    setDeletingAsset(asset);
    setShowDeleteModal(true);
  };

  const confirmDeleteAsset = () => {
    if (!deletingAsset) return;
    deleteAsset(deletingAsset.id);
  };

  const getFileExtension = (filename) => filename.split('.').pop().toLowerCase();
  const isImage = (filename) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(getFileExtension(filename));

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-sm p-6 shadow-none border border-gray-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Assets ({total_assets || 0})</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <ClipLoader color="#3B82F6" size={40} />
          <p className="mt-4 text-xs text-gray-400 dark:text-slate-500 font-medium">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) return <p className="text-red-650 font-semibold text-xs">Error: {error.message || "Failed to load assets"}</p>;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-sm p-6 shadow-none border border-gray-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Assets ({total_assets})</h2>
          {canUpload && (
            <button onClick={handleUploadClick} className="flex items-center gap-1.5 px-2.5 py-1 border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-sm text-xs font-semibold">
              <IoCloudUploadOutline className="w-4 h-4" /> Upload
            </button>
          )}
        </div>

        {assets.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-8">No assets found</p>
        ) : (
          <ul className="space-y-2">
            {assets.map((asset) => (
              <li key={asset.id} className="p-3 bg-gray-50/50 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-sm flex items-center space-x-4 group hover:bg-gray-100/70 dark:hover:bg-slate-800 transition-colors">
                {isImage(asset.file) ? (
                  <img src={asset.file} alt="Asset" className="w-14 h-14 object-cover rounded-sm border border-gray-200 dark:border-slate-700" />
                ) : (
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/40 rounded-sm border border-transparent dark:border-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider">{getFileExtension(asset.file)}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <a href={asset.file} target="_blank" rel="noopener noreferrer" className="text-blue-605 dark:text-blue-400 hover:underline font-bold text-xs truncate block">
                    {asset.file.split('/').pop()}
                  </a>
                  <p className="text-[10px] font-semibold text-gray-700 dark:text-slate-300 mt-0.5">Uploaded by: {asset.uploaded_by?.display_name || "Unknown"}</p>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">{new Date(asset.uploaded_at).toLocaleString()}</p>
                </div>

                {canDelete && (<button
                  onClick={() => openDeleteModal(asset)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-sm"
                  title="Delete asset"
                >
                  <IoTrashOutline className="w-4 h-4" />
                </button>)}
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

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAsset}
        title="Delete Asset"
        message={deletingAsset ? `Are you sure you want to delete ${deletingAsset.file.split('/').pop()}?` : "Are you sure?"}
        isLoading={isDeleting}
      />
    </>
  );
};

export default AssetSection;
