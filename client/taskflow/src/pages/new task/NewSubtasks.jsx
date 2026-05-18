import { useState } from "react";
import { FiPlus, FiTrash2, FiUser } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

const NewSubtasks = ({ subtasks, setSubtasks, assignees, currentUser }) => {
  const handleSubtaskChange = (index, key, value) => {
    setSubtasks((prev) => {
      const newSubtasks = [...prev];
      newSubtasks[index][key] = value;
      return newSubtasks;
    });
  };

  const handleAddSubtask = () => {
    setSubtasks((prev) => [...prev, { text: "", assignee_id: null }]);
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="bg-white dark:bg-gray-800 shadow p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <FiPlus className="text-indigo-600 dark:text-indigo-400" size={18} />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Subtasks</h2>
        <span className="ml-auto text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
          {subtasks.filter(s => s.text.trim() !== "").length} added
        </span>
      </div>

      <div className="space-y-4">
        {subtasks.map((subtask, index) => (
          <div key={index} className="flex flex-col gap-3 bg-white dark:bg-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={subtask.text}
                  onChange={(e) => handleSubtaskChange(index, "text", e.target.value)}
                  placeholder="Enter subtask description..."
                  className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 dark:bg-gray-700 dark:text-gray-100 ${subtask.text.length > 200 ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs font-medium ${subtask.text.length > 200 ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                    {subtask.text.length}/200
                  </span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="relative min-w-[180px]">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={subtask.assignee_id || ""}
                    onChange={(e) => handleSubtaskChange(index, "assignee_id", e.target.value || null)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">No Assignee</option>

                    {/* Current user as first option if exists */}
                    {currentUser && (
                      <option value={currentUser.id} className="font-semibold">
                        {currentUser.display_name}
                      </option>
                    )}

                    {/* Other assignees */}
                    {assignees.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {subtasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <IoClose title="Remove Subtask" size={26} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSubtask}
        className="mt-6 w-full py-3.5 px-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/50 border-2 border-dashed border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:from-indigo-100 hover:to-indigo-200 rounded-md transition-all duration-200 font-medium flex items-center justify-center gap-3"
      >
        <FiPlus size={18} />
        Add Another Subtask
      </button>
    </section>
  );
};

export default NewSubtasks;