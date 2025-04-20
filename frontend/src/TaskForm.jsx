import { useState } from "react";
import { useUser } from "./UserContext";
import { v4 as uuidv4 } from "uuid";

export default function TaskForm({ onTaskCreated }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onTaskCreated?.(); // optional: refresh task list
    } catch (err) {
      console.error(err);
      alert("Error creating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form scale-in">
      <h3>
        <svg className="inline-block w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Create New Task
      </h3>
      
      <div className="form-row">
        <label htmlFor="task-title" className="form-label">Title</label>
        <input
          id="task-title"
          className="form-input"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="form-row">
        <label htmlFor="task-description" className="form-label">Description</label>
        <textarea
          id="task-description"
          className="form-input form-textarea"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="form-actions">
        <button
          type="submit"
          className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
      
      {showSuccess && (
        <div className="form-success">
          <svg className="inline-block w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Task created successfully
        </div>
      )}
    </form>
  );
}