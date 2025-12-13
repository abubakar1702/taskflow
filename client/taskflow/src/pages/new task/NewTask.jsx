import { useState, useEffect, useRef, useCallback } from "react";
import { useApi } from "../../components/hooks/useApi";
import NewSubtasks from "./NewSubtasks";
import { FiCalendar, FiClock, FiFlag, FiList } from "react-icons/fi";
import { MdTaskAlt } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import TaskAssignee from "./TaskAssignee";

const getPlainUser = (result) => (result ? result.user || result : {});

const NewTask = () => {
  const { currentUser } = useTaskPermissions();

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    due_time: "",
    priority: "Medium",
    status: "To Do",
    project_id: "",
    assignees_ids: []
  });

  const [subtasks, setSubtasks] = useState([{ text: "", assignee_id: null }]);
  const [projects, setProjects] = useState([]);
  const [selectedAssigneeObjects, setSelectedAssigneeObjects] = useState([]);
  const [selectedProjectMembers, setSelectedProjectMembers] = useState([]);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("");
  const [assigneeSearchResults, setAssigneeSearchResults] = useState([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { makeRequest } = useApi(null);
  const taskAssigneeRef = useRef();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await makeRequest("/api/projects/", "GET");
        setProjects(data || []);
      } catch {
        toast.error("Failed to load projects");
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (taskFormData.project_id) {
      const project = projects.find((p) => p.id === taskFormData.project_id);
      if (project && project.members) {
        const members = project.members
          .map((member) => getPlainUser(member))
          .filter((member) => member.id !== currentUser?.id);

        setSelectedProjectMembers(members);
        setAssigneeSearchResults(members);
      }
    } else {
      setSelectedProjectMembers([]);
      setAssigneeSearchResults([]);
      setSelectedAssigneeObjects([]);
      setSubtasks([{ text: "", assignee_id: null }]);
      setShowAssigneeDropdown(false);
    }
  }, [taskFormData.project_id, projects, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if ((name === "due_date" || name === "due_time") && value === "") finalValue = null;

    if (name === "due_date" && value && !taskFormData.due_time) {
      setTaskFormData((prev) => ({ ...prev, [name]: finalValue, due_time: "12:00" }));
    } else {
      setTaskFormData((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setTaskFormData((prev) => ({
      ...prev,
      project_id: projectId,
      assignees_ids: []
    }));
    setSelectedAssigneeObjects([]);
    setAssigneeSearchQuery("");
    setSubtasks([{ text: "", assignee_id: null }]);
    setShowAssigneeDropdown(false);
  };

  const handleTaskAssigneeSearch = useCallback(async (query) => {
    const isProjectSelected = !!taskFormData.project_id;
    const projectMembers = selectedProjectMembers;

    if (!query.trim() && isProjectSelected) {
      setAssigneeSearchResults(projectMembers);
      return;
    }

    try {
      let results = [];
      if (isProjectSelected) {
        results = projectMembers.filter(
          (member) =>
            member.display_name?.toLowerCase().includes(query.toLowerCase()) ||
            member.email?.toLowerCase().includes(query.toLowerCase())
        );
      } else if (query.trim()) {
        const searchData = await makeRequest(`/user/search/?q=${encodeURIComponent(query)}`, "GET");
        results = Array.isArray(searchData)
          ? searchData.map(getPlainUser).filter((user) => user.id !== currentUser?.id)
          : [];
      }
      setAssigneeSearchResults(results);
    } catch {
      setAssigneeSearchResults([]);
    }
  }, [taskFormData.project_id, selectedProjectMembers, makeRequest, currentUser]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const timeout = setTimeout(() => handleTaskAssigneeSearch(assigneeSearchQuery), 300);
    searchTimeoutRef.current = timeout;
    return () => clearTimeout(searchTimeoutRef.current);
  }, [assigneeSearchQuery, handleTaskAssigneeSearch]);

  const handleSelectAssignee = (user) => {
    const isAlreadySelected = taskFormData.assignees_ids.includes(user.id);

    if (isAlreadySelected) {
      handleRemoveAssignee(user.id);
    } else {
      setTaskFormData((prev) => ({
        ...prev,
        assignees_ids: [...prev.assignees_ids, user.id]
      }));
      setSelectedAssigneeObjects((prev) => [...prev, user]);
    }

    if (!taskFormData.project_id) {
      setAssigneeSearchQuery("");
      setShowAssigneeDropdown(false);
    }
  };

  const handleRemoveAssignee = (assigneeId) => {
    setTaskFormData((prev) => ({
      ...prev,
      assignees_ids: prev.assignees_ids.filter((id) => id !== assigneeId)
    }));
    setSelectedAssigneeObjects((prev) => prev.filter((user) => user.id !== assigneeId));

    setSubtasks((prev) =>
      prev.map((subtask) => ({
        ...subtask,
        assignee_id: subtask.assignee_id === assigneeId ? null : subtask.assignee_id
      }))
    );
  };

  const handleClickOutside = (e) => {
    if (taskAssigneeRef.current && !taskAssigneeRef.current.contains(e.target)) {
      setShowAssigneeDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSubmit = async () => {

    if (isSubmitting) return;
    if (!taskFormData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    const dataToSend = {
      ...taskFormData,
      due_date: taskFormData.due_date || null,
      due_time: taskFormData.due_time || null,
      subtasks_data: subtasks.filter(subtask => subtask.text.trim() !== "")
    };

    setIsSubmitting(true);

    const toastId = toast.loading("Creating task and subtasks...");

    try {
      const response = await makeRequest("/api/tasks/", "POST", dataToSend);

      toast.update(toastId, {
        render: `Task "${response.title}" and ${response.subtasks?.length || 0} subtasks created successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 5000
      });

      setTaskFormData({
        title: "",
        description: "",
        due_date: "",
        due_time: "",
        priority: "Medium",
        status: "To Do",
        project_id: taskFormData.project_id,
        assignees_ids: []
      });
      setSelectedAssigneeObjects([]);
      setAssigneeSearchQuery("");
      setSubtasks([{ text: "", assignee_id: null }]);
    } catch (err) {
      const detail = err.data?.detail || err.message;
      const fieldErrors =
        err.data && Object.keys(err.data).length > 0
          ? Object.entries(err.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ")
          : null;

      toast.update(toastId, {
        render: fieldErrors || detail || "Failed to create task",
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <MdTaskAlt className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create New Task</h1>
            <p className="text-gray-600">Add task details and subtasks below</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Task Details */}
          <section className="bg-white shadow p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <FiList className="text-blue-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-medium ${taskFormData.title.length >= 200
                        ? 'text-red-600'
                        : taskFormData.title.length >= 150
                          ? 'text-yellow-600'
                          : 'text-gray-500'
                      }`}
                  >
                    {taskFormData.title.length}/200
                  </span>
                </div>
                <input
                  type="text"
                  name="title"
                  value={taskFormData.title}
                  onChange={handleInputChange}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={taskFormData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Describe the task details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project (Optional)</label>
                <div className="relative">
                  <select
                    name="project_id"
                    value={taskFormData.project_id}
                    onChange={handleProjectChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="">No Project (Global Task)</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Date, Time, Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiCalendar className="text-gray-400" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={taskFormData.due_date || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiClock className="text-gray-400" />
                    Due Time
                  </label>
                  <input
                    type="time"
                    name="due_time"
                    value={taskFormData.due_time || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FiFlag className="text-gray-400" />
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={taskFormData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all duration-200"
                  >
                    <option value="Low" className="text-green-600">Low</option>
                    <option value="Medium" className="text-yellow-600">Medium</option>
                    <option value="High" className="text-orange-600">High</option>
                    <option value="Urgent" className="text-red-600">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Task Assignees */}
          <TaskAssignee
            taskFormData={taskFormData}
            selectedAssigneeObjects={selectedAssigneeObjects}
            assigneeSearchQuery={assigneeSearchQuery}
            assigneeSearchResults={assigneeSearchResults}
            showAssigneeDropdown={showAssigneeDropdown}
            handleTaskAssigneeSearch={handleTaskAssigneeSearch}
            setAssigneeSearchQuery={setAssigneeSearchQuery}
            handleSelectAssignee={handleSelectAssignee}
            handleRemoveAssignee={handleRemoveAssignee}
            taskAssigneeRef={taskAssigneeRef}
            setShowAssigneeDropdown={setShowAssigneeDropdown}
          />

          {/* Subtasks */}
          <NewSubtasks
            subtasks={subtasks}
            setSubtasks={setSubtasks}
            assignees={selectedAssigneeObjects}
            currentUser={currentUser}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !taskFormData.title.trim() || taskFormData.title.length > 200}
              className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Task & Subtasks...
                </div>
              ) : (
                "Create Task & Subtasks"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTask;