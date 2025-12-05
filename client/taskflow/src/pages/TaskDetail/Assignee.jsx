import { useState } from "react";
import { useApi } from "../../components/hooks/useApi";

const Assignee = ({ assignees = [], taskId, refetch }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssigneeEmail, setNewAssigneeEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { makeRequest } = useApi();

  const handleAddAssignee = async (e) => {
    e.preventDefault();
    if (!newAssigneeEmail.trim() || !taskId) return;

    setIsAdding(true);
    try {
      await makeRequest(`/api/tasks/${taskId}/assignees/`, "POST", {
        email: newAssigneeEmail.trim(),
      });
      setNewAssigneeEmail("");
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error("Failed to add assignee:", error);
      alert("Failed to add assignee. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAssignee = async (assigneeId) => {
    if (!window.confirm("Are you sure you want to remove this assignee?")) return;

    try {
      await makeRequest(`/api/tasks/${taskId}/assignees/${assigneeId}/`, "DELETE");
      refetch();
    } catch (error) {
      console.error("Failed to remove assignee:", error);
      alert("Failed to remove assignee. Please try again.");
    }
  };

  if (!assignees.length && !showAddForm) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 mb-4">No assignees yet</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Assignee
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Assignees list */}
      <div className="space-y-3">
        {assignees.map((assignee) => (
          <div
            key={assignee.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              {assignee.avatar ? (
                <img
                  src={assignee.avatar}
                  alt={assignee.display_name}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-800">
                    {assignee.display_name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{assignee.display_name}</p>
                <p className="text-sm text-gray-500">{assignee.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleRemoveAssignee(assignee.id)}
              className="text-red-500 hover:text-red-700 p-2"
              title="Remove assignee"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add assignee form */}
      {showAddForm && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Add New Assignee</h3>
          <form onSubmit={handleAddAssignee} className="space-y-3">
            <input
              type="email"
              value={newAssigneeEmail}
              onChange={(e) => setNewAssigneeEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isAdding}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewAssigneeEmail("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding || !newAssigneeEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add assignee button (when form is hidden) */}
      {!showAddForm && assignees.length > 0 && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
        >
          + Add Assignee
        </button>
      )}
    </div>
  );
};

export default Assignee;