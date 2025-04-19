import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { useUser } from "./UserContext";

const TaskList = forwardRef((props, ref) => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadTasks = () => {
    const url = new URL("http://localhost:4000/api/tasks");
    url.searchParams.append("createdBy", user.id);
    if (statusFilter) {
      url.searchParams.append("status", statusFilter);
    }

    fetch(url.toString())
      .then(res => res.json())
      .then(setTasks)
      .catch(err => console.error("Failed to load tasks", err));
  };

  useEffect(() => {
    loadTasks();
  }, [user.id, statusFilter]);

  useImperativeHandle(ref, () => ({
    refresh: loadTasks,
  }));

  const deleteTask = async (id) => {
    const res = await fetch(`http://localhost:4000/api/tasks/${id}?userId=${user.id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const startEdit = (task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };

  const cancelEdit = () => {
    setEditTaskId(null);
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

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Your Tasks</h3>

      {/* ✅ Status Filter */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="done">Done</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="border p-4 rounded">
            {editTaskId === task.id ? (
              <>
                <input
                  className="border p-2 w-full mb-2"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="border p-2 w-full mb-2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(task.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold">{task.title}</div>
                <div>{task.description}</div>
                <div className="text-sm text-gray-500">
                    Created by: <strong>{task.creatorName}</strong> at {new Date(task.createdAt).toLocaleString()}
                </div>
                <div>Status: {task.status}</div>

                {task.status === "pending" && (
                  <div className="mt-2 space-x-2">
                    <button onClick={() => startEdit(task)} className="text-blue-600">Edit</button>
                    <button onClick={() => deleteTask(task.id)} className="text-red-600">Delete</button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TaskList;
