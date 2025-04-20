import { useEffect, useRef, useState } from "react";
import { useUser } from "./UserContext";
import TaskList from "./TaskList";

export default function ApproverView() {
  const { user, logout } = useUser();
  const taskListRef = useRef();

  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [showDone, setShowDone] = useState(false);

  const loadTasks = () => {
    const url = new URL("http://localhost:4000/api/tasks");
    if (statusFilter) url.searchParams.append("status", statusFilter);
    url.searchParams.append("role", user.role);

    fetch(url.toString())
      .then((res) => res.json())
      .then(setTasks)
      .catch((err) => console.error("Failed to load tasks", err));
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const updateStatus = async (id, newStatus) => {
    const res = await fetch(`http://localhost:4000/api/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) loadTasks();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(tasks.filter(t => t.status !== "done"));
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = [...reordered, ...tasks.filter(t => t.status === "done")];

    setTasks(updated);

    const orderedIds = reordered.map((t) => t.id);
    await fetch("http://localhost:4000/api/tasks/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds, role: user.role }),
    });
  };

  const renderTask = (task) => (
    <>
      <div className="task-title">{task.title}</div>
      <div className="task-description">{task.description}</div>
      
      <div className="task-meta">
        <div className="task-creator">
          Created by: <span className="task-creator-name">{task.creatorName}</span>
          <span className="task-date ml-2">
            {new Date(task.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="task-status mt-2">
        <span className={`text-badge text-badge-${task.status}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>

      {task.status === "pending" && (
        <div className="task-actions">
          <button
            onClick={() => updateStatus(task.id, "approved")}
            className="btn btn-approve"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Approve
          </button>
          <button
            onClick={() => updateStatus(task.id, "rejected")}
            className="btn btn-reject"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reject
          </button>
        </div>
      )}

      {task.status === "approved" && (
        <div className="task-actions">
          <button
            onClick={() => updateStatus(task.id, "done")}
            className="btn btn-done"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Mark as Done
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="page-container fade-in">
      <div className="user-welcome">
        <div>
          <h2>Welcome, {user.name}!</h2>
          <div className="mt-2">
            <span className="user-role approver-role">
              <svg className="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-outline"
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>

      <TaskList
        ref={taskListRef}
        tasks={tasks}
        showDone={showDone}
        allowEdit={false}
        allowDelete={false}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showDoneToggle={true}
        onToggleDone={() => setShowDone(prev => !prev)}
        onDragEnd={handleDragEnd}
        renderTask={renderTask}
      />
    </div>
  );
}