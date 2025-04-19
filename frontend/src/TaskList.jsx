import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { useUser } from "./UserContext";

const TaskList = forwardRef((props, ref) => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showDone, setShowDone] = useState(false);

  const loadTasks = () => {
    const url = new URL("http://localhost:4000/api/tasks");
    url.searchParams.append("role", user.role);
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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(activeTasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = [...reordered, ...doneTasks];

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

  const activeTasks = tasks.filter(t => t.status !== "done");
  const doneTasks = tasks.filter(t => t.status === "done");

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

      {/* ✅ Drag-and-drop for non-done tasks */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {activeTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="border p-4 rounded bg-white"
                    >
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
                            Created by: <strong>{task.creatorName}</strong> at{" "}
                            {new Date(task.createdAt).toLocaleString()}
                          </div>
                          <div>Status: {task.status}</div>

                          {task.status === "pending" && (
                            <div className="mt-2 space-x-2">
                              <button
                                onClick={() => startEdit(task)}
                                className="text-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {/* ✅ Done Task Toggle (only if All selected) */}
      {statusFilter === "" && doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowDone(!showDone)}
            className="text-sm text-gray-700 underline"
          >
            {showDone ? "Hide Done Tasks" : `Show Done Tasks (${doneTasks.length})`}
          </button>

          {showDone && (
            <ul className="mt-2 space-y-2">
              {doneTasks.map((task) => (
                <li key={task.id} className="border p-4 rounded bg-gray-100">
                  <div className="font-semibold">{task.title}</div>
                  <div>{task.description}</div>
                  <div className="text-sm text-gray-500">
                    Created by: <strong>{task.creatorName}</strong> at{" "}
                    {new Date(task.createdAt).toLocaleString()}
                  </div>
                  <div>Status: {task.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ✅ If statusFilter is 'done', always show them */}
      {statusFilter === "done" && doneTasks.length > 0 && (
        <ul className="mt-6 space-y-2">
          {doneTasks.map((task) => (
            <li key={task.id} className="border p-4 rounded bg-gray-100">
              <div className="font-semibold">{task.title}</div>
              <div>{task.description}</div>
              <div className="text-sm text-gray-500">
                Created by: <strong>{task.creatorName}</strong> at{" "}
                {new Date(task.createdAt).toLocaleString()}
              </div>
              <div>Status: {task.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default TaskList;
