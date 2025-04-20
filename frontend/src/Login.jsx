import { useUser } from "./UserContext";
import logoImage from "./assets/evident-logo.png"; // Import the PNG logo

export default function Login() {
  const { login, mockUsers } = useUser();

  return (
    <div className="login-container">
      <div className="login-card scale-in">
        <div className="mb-6">
          {/* Fixed logo with preserved aspect ratio */}
          <div className="text-center mb-2">
            <img 
              src={logoImage} 
              alt="EVident Battery" 
              className="h-20 mx-auto object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-gray-600 mt-2">Please select a user to continue</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="user-select" className="form-label">Select User</label>
          <select
            id="user-select"
            className="form-input"
            onChange={(e) => login(e.target.value)}
            defaultValue=""
          >
            <option disabled value="">-- Select User --</option>
            {mockUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 text-center text-gray-500 text-sm">
          <p>A professional task management system</p>
        </div>
      </div>
    </div>
  );
}