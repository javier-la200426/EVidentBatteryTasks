import { useUser } from "./UserContext";
import Login from "./Login";
import SubmitterView from "./SubmitterView";
import ApproverView from "./ApproverView";
import logoImage from "./assets/evident-logo.png"; // Import the logo
import "./styles/index.css";

function Header() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm mb-6">
      <div className="flex items-center">
        <img src={logoImage} alt="EVident Battery" className="h-10" />
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useUser();

  return (
    <div className="app-container">
      <Header />
      {/* Role-based view */}
      {user.role === "submitter" && <SubmitterView />}
      {user.role === "approver" && <ApproverView />}
    </div>
  );
}

function App() {
  const { user } = useUser();

  return (
    <div className="App min-h-screen bg-gray-50">
      {!user ? <Login /> : <Dashboard />}
    </div>
  );
}

export default App;