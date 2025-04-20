import { useState } from "react";
import { useUser } from "./UserContext";
import logoImage from "./assets/evident-logo.png";

export default function Login() {
  const { login, mockUsers } = useUser();
  const [selectedUserId, setSelectedUserId] = useState("");

  return (
    <div className="login-container" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}>
      <div className="login-card scale-in">
        <div className="mb-6">
          <div className="text-center mb-4">
            <img 
              src={logoImage} 
              alt="EVident Battery" 
              className="h-16 mx-auto object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
          <div className="h-1 w-20 bg-primary mx-auto my-4" style={{ backgroundColor: '#1d8464' }}></div>
          <p className="text-gray-600 mt-2">Please select a user to continue</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="user-select" className="form-label">Select User</label>
          <select
            id="user-select"
            className="form-input border border-gray-300 w-full py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ "--tw-ring-color": "rgba(29, 132, 100, 0.5)" }}
          >
            <option disabled value="">-- Select User --</option>
            {mockUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => selectedUserId && login(selectedUserId)}
            className="btn px-6 py-2 rounded text-white font-medium"
            style={{ backgroundColor: '#1d8464' }}
            disabled={!selectedUserId}
          >
            Login
          </button>
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>A professional task management system</p>
        </div>
      </div>
    </div>
  );
}
