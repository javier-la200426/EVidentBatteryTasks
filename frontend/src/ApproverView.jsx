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
      <div className="font-semibold">{task.title}</div>
      <div className="text-sm text-gray-500">
        Created by: <strong>{task.creatorName}</strong> at{" "}
        {new Date(task.createdAt).toLocaleString()}
      </div>
      <div>{task.description}</div>
      <div>Status: <strong>{task.status}</strong></div>

      {task.status === "pending" && (
        <div className="mt-2 space-x-2">
          <button
            onClick={() => updateStatus(task.id, "approved")}
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => updateStatus(task.id, "rejected")}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      )}

      {task.status === "approved" && (
        <div className="mt-2">
          <button
            onClick={() => updateStatus(task.id, "done")}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Mark as Done
          </button>
        </div>
      )}
    </>
  );

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
