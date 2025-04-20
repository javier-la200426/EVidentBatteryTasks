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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Welcome, {user.name}!</h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <p>Your role is: <strong>{user.role}</strong></p>

      <TaskForm onTaskCreated={() => loadTasks()} />

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
  );
}
