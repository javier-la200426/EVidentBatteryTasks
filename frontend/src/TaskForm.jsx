import { useState } from "react";
import { useUser } from "./UserContext";
import { v4 as uuidv4 } from "uuid";

export default function TaskForm({ onTaskCreated }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const task = {
      id: uuidv4(),
      title,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    try {
      const res = await fetch("http://localhost:4000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (!res.ok) throw new Error("Failed to save task");

      setTitle("");
      setDescription("");
      onTaskCreated?.(); // optional: refresh task list
    } catch (err) {
      console.error(err);
      alert("Error creating task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">Create Task</h3>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="border p-2 w-full mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Add Task
      </button>
    </form>
  );
}
