import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaPencilAlt,
  FaPlus,
  FaSearch,
  FaTrash,
  FaMoon,
  FaSun,
  FaClock,
  FaTasks,
  FaCheckCircle,
  FaRegCircle,
  FaBars,
  FaTimes,
  FaExclamationTriangle,
  FaThLarge,
  FaList,
  FaChartPie,
  FaSlidersH,
  FaInbox,
  FaAward
} from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { CreateTask, FetchTask, DeleteTasks, CompletedTasks } from "./Api";
import { notify } from "./Utils";

function TaskManager() {
  // --- STATE DECLARATIONS ---
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Layout and Sidebar state
  const [viewLayout, setViewLayout] = useState("list"); // Default to clean mobile list view
  const [activeMenuFilter, setActiveMenuFilter] = useState("all"); // 'all', 'pending', 'completed', 'stats', 'high', 'medium', 'low'
  const [searchQuery, setSearchQuery] = useState("");

  // Modal and Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [updateTask, setUpdateTask] = useState(null);
  const [taskdata, setTaskdata] = useState({
    taskName: "",
    taskDescription: "",
    taskDueDate: "",
    priority: "Medium",
    isDone: false,
  });

  // Delete Confirmation Dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // --- THEME EFFECT ---
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove("light-theme");
    } else {
      root.classList.add("light-theme");
    }
  }, [isDarkMode]);

  // --- PREVENT SCROLL PENETRATION ---
  useEffect(() => {
    if (isFormOpen || isConfirmOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isFormOpen, isConfirmOpen]);

  // --- FETCH ALL TASKS ---
  const fetchAllTasks = async () => {
    setIsLoading(true);
    try {
      const response = await FetchTask();
      if (response && response.success) {
        const data = response.data ? response.data.slice().reverse() : [];
        setTasks(data);
      } else {
        notify(response?.message || "Failed to load tasks", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Could not connect to server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // --- DYNAMIC SEARCH & SIDEBAR FILTER MERGER ---
  useEffect(() => {
    let result = [...tasks];

    // Apply Sidebar / Bottom Tab Filter (skip filtering if viewing Stats page)
    if (activeMenuFilter === "pending") {
      result = result.filter((task) => !task.isDone);
    } else if (activeMenuFilter === "completed") {
      result = result.filter((task) => task.isDone);
    } else if (["high", "medium", "low"].includes(activeMenuFilter)) {
      result = result.filter(
        (task) => task.priority?.toLowerCase() === activeMenuFilter
      );
    }

    // Apply Search Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.taskName.toLowerCase().includes(query) ||
          task.taskDescription.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(result);
  }, [tasks, activeMenuFilter, searchQuery]);

  // --- COMPUTED PRODUCTIVITY STATS ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.isDone).length;
  const pendingTasks = totalTasks - completedTasks;
  const completedPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority specific counts
  const highPriorityTasks = tasks.filter((t) => t.priority === "High").length;
  const mediumPriorityTasks = tasks.filter((t) => t.priority === "Medium").length;
  const lowPriorityTasks = tasks.filter((t) => t.priority === "Low").length;

  // --- FORM HANDLERS ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    setTaskdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreateModal = () => {
    setUpdateTask(null);
    setTaskdata({
      taskName: "",
      taskDescription: "",
      taskDueDate: new Date().toISOString().split("T")[0],
      priority: "Medium",
      isDone: false,
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setUpdateTask(task);
    const dateFormatted = task.taskDueDate ? task.taskDueDate.split("T")[0] : "";
    setTaskdata({
      taskName: task.taskName || "",
      taskDescription: task.taskDescription || "",
      taskDueDate: dateFormatted,
      priority: task.priority || "Medium",
      isDone: task.isDone || false,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    const payload = {
      taskName: taskdata.taskName.trim(),
      taskDescription: taskdata.taskDescription.trim(),
      taskDueDate: taskdata.taskDueDate,
      priority: taskdata.priority,
      isDone: taskdata.isDone,
    };

    try {
      if (updateTask) {
        const response = await CompletedTasks(updateTask._id, payload);
        if (response && response.success) {
          notify(response.message || "Task updated successfully", "success");
          fetchAllTasks();
        } else {
          notify(response?.message || "Failed to update task", "error");
        }
      } else {
        const response = await CreateTask(payload);
        if (response && response.success) {
          notify(response.message || "Task created successfully", "success");
          fetchAllTasks();
        } else {
          notify(response?.message || "Failed to create task", "error");
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      notify("An unexpected error occurred", "error");
    }
  };

  // --- TASK COMPLETE STATUS TOGGLE ---
  const handleToggleComplete = async (task) => {
    const payload = {
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      taskDueDate: task.taskDueDate,
      priority: task.priority,
      isDone: !task.isDone,
    };

    try {
      const response = await CompletedTasks(task._id, payload);
      if (response && response.success) {
        notify(
          task.isDone ? "Task marked as pending" : "Task completed! 🎉",
          "success"
        );
        fetchAllTasks();
      } else {
        notify(response?.message || "Failed to update status", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Failed to change task status", "error");
    }
  };

  // --- DELETE CONFIRMATION HANDLERS ---
  const handleTriggerDelete = (id) => {
    setTaskToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await DeleteTasks(taskToDelete);
      if (response && response.success) {
        notify(response.message || "Task deleted successfully", "success");
        fetchAllTasks();
      } else {
        notify(response?.message || "Failed to delete task", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Failed to delete task", "error");
    } finally {
      setIsConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const formatDateString = (dateStr) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Select positive encouragement text based on progress
  const getProgressMessage = () => {
    if (totalTasks === 0) return "Add some tasks to start mapping out your progress!";
    if (completedPercent === 0) return "You can do this! Complete a task to build momentum.";
    if (completedPercent < 50) return "Starting strong! Stay consistent to reach your goal.";
    if (completedPercent < 100) return "Over halfway there! Keep pushing to clear your list.";
    return "Outstanding! You cleared all tasks on your dashboard today! 🏆";
  };

  return (
    <>
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="sidebar">
        <div className="brand-section">
          <span className="brand-logo">TaskMate</span>
          <span className="brand-badge">v1.2</span>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-label">Views</li>
          <li
            className={`menu-item ${activeMenuFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveMenuFilter("all")}
          >
            <div className="menu-item-left">
              <FaTasks />
              <span>All Tasks</span>
            </div>
            <span className="menu-badge">{totalTasks}</span>
          </li>
          <li
            className={`menu-item ${activeMenuFilter === "pending" ? "active" : ""}`}
            onClick={() => setActiveMenuFilter("pending")}
          >
            <div className="menu-item-left">
              <FaClock style={{ color: "var(--warning-color)" }} />
              <span>Pending</span>
            </div>
            <span className="menu-badge">{pendingTasks}</span>
          </li>
          <li
            className={`menu-item ${activeMenuFilter === "completed" ? "active" : ""}`}
            onClick={() => setActiveMenuFilter("completed")}
          >
            <div className="menu-item-left">
              <FaCheckCircle style={{ color: "var(--success-color)" }} />
              <span>Completed</span>
            </div>
            <span className="menu-badge">{completedTasks}</span>
          </li>
          <li
            className={`menu-item ${activeMenuFilter === "stats" ? "active" : ""}`}
            onClick={() => setActiveMenuFilter("stats")}
          >
            <div className="menu-item-left">
              <FaChartPie style={{ color: "var(--accent-color)" }} />
              <span>Stats & Report</span>
            </div>
          </li>

          <li className="menu-label" style={{ marginTop: "16px" }}>
            Priorities
          </li>
          <li
            className={`menu-item ${activeMenuFilter === "high" ? "active" : ""}`}
            onClick={() => setActiveMenuFilter("high")}
          >
            <div className="menu-item-left">
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--danger-color)",
                }}
              ></span>
              <span>High Priority</span>
            </div>
            <span className="menu-badge">{highPriorityTasks}</span>
          </li>
          <li
            className={`menu-item ${activeMenuFilter === "medium" ? "active" : ""}`}
            onClick={() => setActiveMenuFilter("medium")}
          >
            <div className="menu-item-left">
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--warning-color)",
                }}
              ></span>
              <span>Medium Priority</span>
            </div>
            <span className="menu-badge">{mediumPriorityTasks}</span>
          </li>
          <li
            className={`menu-item ${activeMenuFilter === "low" ? "active" : ""}`}
            onClick={() => setActiveMenuFilter("low")}
          >
            <div className="menu-item-left">
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--success-color)",
                }}
              ></span>
              <span>Low Priority</span>
            </div>
            <span className="menu-badge">{lowPriorityTasks}</span>
          </li>
        </ul>

        {/* Desktop sidebar Stats Block */}
        <div className="stats-container">
          <div className="stats-header">
            <span className="stats-title">Day Progress</span>
            <span className="stats-percent">{completedPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${completedPercent}%` }}
            ></div>
          </div>
          <span className="stats-subtitle">
            {completedTasks} of {totalTasks} tasks completed
          </span>
        </div>

        {/* Theme Toggler */}
        <button
          className="theme-toggle-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? (
            <>
              <FaSun /> <span>Light UI</span>
            </>
          ) : (
            <>
              <FaMoon /> <span>Dark UI</span>
            </>
          )}
        </button>
      </aside>

      {/* ==================== MAIN CANVAS ==================== */}
      <main className="main-content">
        {/* Dynamic header row on mobile: includes app title and dark mode quick switch */}
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1 className="welcome-title">
              {activeMenuFilter === "all" && "All Tasks"}
              {activeMenuFilter === "pending" && "Pending Items"}
              {activeMenuFilter === "completed" && "Completed Items"}
              {activeMenuFilter === "stats" && "Report & Analytics"}
              {activeMenuFilter === "high" && "High Priority"}
              {activeMenuFilter === "medium" && "Medium Priority"}
              {activeMenuFilter === "low" && "Low Priority"}
            </h1>
            <p className="welcome-subtitle">
              {activeMenuFilter === "stats"
                ? "Your productivity index and task distribution."
                : "Swipe to inspect or click standard circles to check off items."}
            </p>
          </div>

          <div className="action-bar">
            {/* Dark mode switcher on mobile (compact top header toggle) */}
            <button
              className="view-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle color theme"
              style={{ borderRadius: "var(--radius-full)", padding: "10px" }}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewLayout === "grid" ? "active" : ""}`}
                onClick={() => setViewLayout("grid")}
                title="Grid layout"
              >
                <FaThLarge />
              </button>
              <button
                className={`view-btn ${viewLayout === "list" ? "active" : ""}`}
                onClick={() => setViewLayout("list")}
                title="List layout"
              >
                <FaList />
              </button>
            </div>

            <button
              className="btn-primary-new"
              onClick={handleOpenCreateModal}
            >
              <FaPlus /> <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Hide search row on Stats tab to preserve clean mobile viewport */}
        {activeMenuFilter !== "stats" && (
          <section className="search-filter-row">
            <div className="search-wrapper">
              <FaSearch className="search-icon-inside" />
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>
        )}

        {/* ==================== VIEW ROUTER (TASKS VS STATS ANALYTICS) ==================== */}
        {activeMenuFilter === "stats" ? (
          /* --- MOBILE FRIENDLY ANALYTICS PANEL --- */
          <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="stats-container-mobile" style={{ padding: "24px", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--accent-color)" }}>
                <FaAward style={{ fontSize: "1.5rem" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Your Stats</h3>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "10px" }}>
                <span style={{ fontSize: "3rem", fontWeight: "800", letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
                  {completedPercent}%
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                  {completedTasks} of {totalTasks} finished
                </span>
              </div>

              <div className="progress-bar-bg" style={{ height: "10px" }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${completedPercent}%` }}
                ></div>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.4", fontStyle: "italic" }}>
                "{getProgressMessage()}"
              </p>
            </div>

            {/* Task distribution metrics row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
              <div className="stats-container-mobile" style={{ alignItems: "center", textAlign: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Pending</span>
                <span style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--warning-color)" }}>{pendingTasks}</span>
              </div>
              <div className="stats-container-mobile" style={{ alignItems: "center", textAlign: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>High Priority</span>
                <span style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--danger-color)" }}>{highPriorityTasks}</span>
              </div>
              <div className="stats-container-mobile" style={{ alignItems: "center", textAlign: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Medium Priority</span>
                <span style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--warning-color)" }}>{mediumPriorityTasks}</span>
              </div>
              <div className="stats-container-mobile" style={{ alignItems: "center", textAlign: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Low Priority</span>
                <span style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--success-color)" }}>{lowPriorityTasks}</span>
              </div>
            </div>
          </section>
        ) : (
          /* --- TASK RENDERER CANVAS --- */
          <section>
            {isLoading ? (
              <ul className={viewLayout === "grid" ? "task-grid" : "task-list"}>
                {[1, 2, 3].map((num) => (
                  <li key={num} className="skeleton-card">
                    <div className="skeleton-shimmer"></div>
                    <div className="skeleton-line skeleton-title"></div>
                    <div className="skeleton-line skeleton-text"></div>
                    <div className="skeleton-line skeleton-text-short"></div>
                    <div className="skeleton-footer">
                      <div className="skeleton-line" style={{ width: "80px", height: "20px" }}></div>
                      <div className="skeleton-line" style={{ width: "50px", height: "20px" }}></div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state-container">
                <div className="empty-state-icon-wrapper">
                  <FaInbox />
                </div>
                <h3 className="empty-state-title">No tasks found</h3>
                <p className="empty-state-desc">
                  {searchQuery
                    ? "We couldn't find any tasks matching your search. Try checking your spelling or filters."
                    : "Your tab is completely clear of work. Create a new task to map out your goals!"}
                </p>
                {!searchQuery && (
                  <button
                    className="btn-primary-new"
                    onClick={handleOpenCreateModal}
                    style={{ display: "inline-flex" }}
                  >
                    <FaPlus /> <span>Create Task</span>
                  </button>
                )}
              </div>
            ) : (
              <ul className={viewLayout === "grid" ? "task-grid" : "task-list"}>
                {filteredTasks.map((item) => (
                  <li
                    key={item._id}
                    className={`task-card-new ${item.isDone ? "done" : ""} ${
                      viewLayout === "list" ? "list-layout" : ""
                    }`}
                  >
                    <div className="task-card-header">
                      <div
                        className={`checkbox-container ${
                          item.isDone ? "checkbox-active" : ""
                        }`}
                        onClick={() => handleToggleComplete(item)}
                      >
                        <span className="checkbox-custom">
                          {item.isDone ? <FaCheck /> : null}
                        </span>
                      </div>
                      <h3
                        className={`task-card-title ${
                          item.isDone ? "strike" : ""
                        }`}
                      >
                        {item.taskName}
                      </h3>
                    </div>

                    <p className="task-card-desc">{item.taskDescription}</p>

                    <div className="task-card-footer">
                      <div className="task-card-meta">
                        <span className="badge-meta">
                          <FaClock />{" "}
                          <span>Due {formatDateString(item.taskDueDate)}</span>
                        </span>
                        <span
                          className={`badge-priority ${
                            item.priority?.toLowerCase() || "medium"
                          }`}
                        >
                          {item.priority || "Medium"}
                        </span>
                      </div>

                      <div className="task-card-actions">
                        <button
                          className="action-btn-card"
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          className="action-btn-card delete"
                          onClick={() => handleTriggerDelete(item._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      {/* ==================== MOBILE FLOATING ACTION BUTTON (FAB) ==================== */}
      <button
        className="mobile-fab"
        onClick={handleOpenCreateModal}
        title="Create new task"
      >
        <FaPlus />
      </button>

      {/* ==================== MOBILE BOTTOM NAVIGATION BAR ==================== */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${activeMenuFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveMenuFilter("all")}
        >
          <FaTasks className="bottom-nav-icon" />
          <span>All</span>
        </button>
        <button
          className={`bottom-nav-item ${activeMenuFilter === "pending" ? "active" : ""}`}
          onClick={() => setActiveMenuFilter("pending")}
        >
          <FaClock className="bottom-nav-icon" />
          <span>Pending</span>
        </button>
        <button
          className={`bottom-nav-item ${activeMenuFilter === "completed" ? "active" : ""}`}
          onClick={() => setActiveMenuFilter("completed")}
        >
          <FaCheckCircle className="bottom-nav-icon" />
          <span>Completed</span>
        </button>
        <button
          className={`bottom-nav-item ${activeMenuFilter === "stats" ? "active" : ""}`}
          onClick={() => setActiveMenuFilter("stats")}
        >
          <FaChartPie className="bottom-nav-icon" />
          <span>Stats</span>
        </button>
      </nav>

      {/* ==================== CREATE / EDIT BOTTOM SHEET FORM ==================== */}
      <div className={`modal-backdrop ${isFormOpen ? "open" : ""}`}>
        <div className="modal-container">
          {/* Draggable drag handlebar decoration on mobile bottom sheets */}
          <div className="bottom-sheet-handle"></div>

          <header className="modal-header">
            <h2 className="modal-title">
              {updateTask ? "Edit Details" : "Create Task"}
            </h2>
            <button
              className="modal-close-btn"
              onClick={() => setIsFormOpen(false)}
            >
              <FaTimes />
            </button>
          </header>

          <form onSubmit={handleSubmitForm}>
            <div className="modal-body">
              <div className="form-group-new">
                <label htmlFor="taskName">Task Name</label>
                <input
                  type="text"
                  id="taskName"
                  name="taskName"
                  className="form-input-new"
                  placeholder="e.g. Design app design system"
                  value={taskdata.taskName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-new">
                <label htmlFor="taskDescription">Description</label>
                <textarea
                  id="taskDescription"
                  name="taskDescription"
                  className="form-input-new"
                  placeholder="Add a summary or details about this task..."
                  value={taskdata.taskDescription}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-group-new">
                <label htmlFor="taskDueDate">Due Date</label>
                <input
                  type="date"
                  id="taskDueDate"
                  name="taskDueDate"
                  className="form-input-new"
                  value={taskdata.taskDueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-new">
                <label htmlFor="priority">Priority Level</label>
                <select
                  id="priority"
                  name="priority"
                  className="form-input-new"
                  value={taskdata.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              </div>
            </div>

            <footer className="modal-footer">
              <button
                type="button"
                className="btn-secondary-new"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary-new">
                {updateTask ? "Save" : "Submit"}
              </button>
            </footer>
          </form>
        </div>
      </div>

      {/* ==================== DELETE CONFIRMATION BOTTOM SHEET ==================== */}
      <div className={`modal-backdrop ${isConfirmOpen ? "open" : ""}`}>
        <div className="modal-container" style={{ maxWidth: "420px" }}>
          <div className="bottom-sheet-handle"></div>

          <header className="modal-header">
            <h2 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--danger-color)" }}>
              <FaExclamationTriangle /> Delete Task?
            </h2>
            <button
              className="modal-close-btn"
              onClick={() => setIsConfirmOpen(false)}
            >
              <FaTimes />
            </button>
          </header>

          <div className="confirm-modal-body">
            <p className="confirm-text">
              Are you sure you want to delete this task? This action is permanent and cannot be undone.
            </p>
          </div>

          <footer className="modal-footer" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <button
              type="button"
              className="btn-secondary-new"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger-new"
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
          </footer>
        </div>
      </div>

      {/* Toast notifications container */}
      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={true}
        theme={isDarkMode ? "dark" : "light"}
      />
    </>
  );
}

export default TaskManager;
