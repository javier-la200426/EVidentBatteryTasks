import { useUser } from "./UserContext";
import Login from "./Login";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import ApproverView from "./ApproverView"; // ✅ Add this
import { useRef } from "react";

function Dashboard() {
  const { user, logout } = useUser();
  const taskListRef = useRef();

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

      {/* Submitter View */}
      {user.role === "submitter" && (
        <>
          <TaskForm onTaskCreated={() => taskListRef.current?.refresh()} />
          <TaskList ref={taskListRef} />
        </>
      )}

      {/* Approver View */}
      {user.role === "approver" && <ApproverView />}
    </div>
  );
}

function App() {
  const { user } = useUser();

  return (
    <div className="App">
      {!user ? <Login /> : <Dashboard />}
    </div>
  );
}

export default App;
