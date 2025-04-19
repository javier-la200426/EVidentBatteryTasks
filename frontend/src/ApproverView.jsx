import { useEffect, useState } from "react";

export default function ApproverView() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadTasks = () => {
    const url = new URL("http://localhost:4000/api/tasks");
    if (statusFilter) url.searchParams.append("status", statusFilter);

    fetch(url.toString())
      .then((res) => res.json())
      .then(setTasks);
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

    if (res.ok) {
      loadTasks(); // refresh list after update
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">All Tasks</h3>

      {/* ✅ Filter by Status */}
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
        {tasks.map((task) => (
          <li key={task.id} className="border p-4 rounded">
            <div className="font-semibold">{task.title}</div>
            <div className="text-sm text-gray-500">
                Created by: <strong>{task.creatorName}</strong> at {new Date(task.createdAt).toLocaleString()}
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
          </li>
        ))}
      </ul>
    </div>
  );
}
