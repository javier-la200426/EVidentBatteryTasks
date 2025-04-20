import { useUser } from "./UserContext";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { useEffect, useRef, useState } from "react";

export default function SubmitterView() {
  const { user, logout } = useUser();
  const taskListRef = useRef();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [editableId, setEditableId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showDone, setShowDone] = useState(false);

  const loadTasks = () => {
    const url = new URL("http://localhost:4000/api/tasks");
    url.searchParams.append("role", user.role);
    url.searchParams.append("createdBy", user.id);
    if (statusFilter) url.searchParams.append("status", statusFilter);

    fetch(url.toString())
      .then((res) => res.json())
      .then(setTasks)
      .catch((err) => console.error("Failed to load tasks", err));
  };

  useEffect(() => {
    loadTasks();
  }, [user.id, statusFilter]);

  useEffect(() => {
    if (taskListRef.current) {
      taskListRef.current.refresh = loadTasks;
    }
  }, [taskListRef.current]);

  const deleteTask = async (id) => {
    const res = await fetch(`http://localhost:4000/api/tasks/${id}?userId=${user.id}`, {
      method: "DELETE"
    });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const startEdit = (task) => {
    setEditableId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const cancelEdit = () => {
    setEditableId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async (id) => {
    const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        title: editTitle,
        description: editDescription
      }),
    });

    if (res.ok) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, title: editTitle, description: editDescription } : t
        )
      );
      cancelEdit();
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(tasks.filter((t) => t.status !== "done"));
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = [...reordered, ...tasks.filter((t) => t.status === "done")];

    setTasks(updated);

    const orderedIds = reordered.map((t) => t.id);

    await fetch("http://localhost:4000/api/tasks/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderedIds,
        role: user.role,
      }),
    });
  };

  return (
    <div className="page-container fade-in">
      <div className="user-welcome">
        <div>
          <h2>Welcome, {user.name}!</h2>
          <div className="mt-2">
            <span className={`user-role ${user.role === "submitter" ? "submitter-role" : ""}`}>
              <svg className="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

      <div className="dashboard-container">
        <div>
          <TaskForm onTaskCreated={() => loadTasks()} />
        </div>
        
        <div>
          <TaskList
            ref={taskListRef}
            tasks={tasks}
            editableId={editableId}
            editTitle={editTitle}
            editDescription={editDescription}
            statusFilter={statusFilter}
            showDone={showDone}
            allowEdit={true}
            allowDelete={true}
            showDoneToggle={true}
            onStatusFilterChange={setStatusFilter}
            onEdit={startEdit}
            onDelete={deleteTask}
            onEditTitleChange={setEditTitle}
            onEditDescriptionChange={setEditDescription}
            onEditCancel={cancelEdit}
            onEditSave={saveEdit}
            onToggleDone={() => setShowDone((prev) => !prev)}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>
    </div>
  );
}