import { useUser } from "./UserContext";
import Login from "./Login";
import SubmitterView from "./SubmitterView"; // ✅ new import
import ApproverView from "./ApproverView";   // ✅ already imported

function Dashboard() {
  const { user } = useUser();

  return (
    <div className="p-4">
      {/* Role-based view */}
      {user.role === "submitter" && <SubmitterView />}
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
