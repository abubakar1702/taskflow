import { FiUserPlus, FiUsers, FiSearch, FiX } from "react-icons/fi";
import Avatar from "../../components/common/Avatar";

const TaskAssignee = ({
  taskFormData,
  selectedAssigneeObjects,
  assigneeSearchQuery,
  assigneeSearchResults,
  showAssigneeDropdown,
  handleTaskAssigneeSearch,
  setAssigneeSearchQuery,
  handleSelectAssignee,
  handleRemoveAssignee,
  taskAssigneeRef,
  setShowAssigneeDropdown
}) => {
  return (
    <section className="bg-white shadow p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiUserPlus className="text-blue-600" size={20} />
          <h2 className="text-xl font-semibold text-gray-800">Assignees</h2>
        </div>
        {taskFormData.project_id ? (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <FiUsers size={14} /> Project Members Only
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
            <FiUsers size={14} /> Search to Add
          </span>
        )}
      </div>

      <div ref={taskAssigneeRef} className="space-y-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={assigneeSearchQuery}
            onChange={(e) => setAssigneeSearchQuery(e.target.value)}
            onFocus={() => {
              handleTaskAssigneeSearch(assigneeSearchQuery);
              setShowAssigneeDropdown(true);
            }}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder={
              taskFormData.project_id
                ? "Search project members..."
                : "Search users to add as assignees..."
            }
          />
          {showAssigneeDropdown && assigneeSearchResults.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-72 overflow-y-auto">
              <div className="p-2">
                {assigneeSearchResults.map((user) => {
                  const isSelected = taskFormData.assignees_ids.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                        }`}
                      onClick={() => handleSelectAssignee(user)}
                    >
                      <Avatar name={user.display_name} url={user.avatar} size={8} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isSelected ? "text-blue-800" : "text-gray-800"}`}>
                          {user.display_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 p-1.5 bg-blue-100 rounded-full">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedAssigneeObjects.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              <Avatar name={user.display_name} url={user.avatar} size={6} />
              <span className="text-sm font-medium">{user.display_name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAssignee(user.id)}
                className="ml-2 p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
          {selectedAssigneeObjects.length === 0 && (
            <div className="w-full py-6 text-center border-2 border-dashed border-gray-300 rounded-xl">
              <FiUsers className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="text-gray-500 text-sm">
                {taskFormData.project_id
                  ? "No assignees selected. Select from project members above."
                  : "No assignees selected. Search and add users above."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TaskAssignee;