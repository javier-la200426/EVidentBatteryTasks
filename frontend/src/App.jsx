import { useUser } from "./UserContext";
import Login from "./Login";
import SubmitterView from "./SubmitterView";
import ApproverView from "./ApproverView";
import logoImage from "./assets/evident-logo.png"; 
import { useState, useEffect } from "react";
import "./styles/index.css";

// Simplified Intro Animation Component
function IntroAnimation({ onComplete }) {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    // Start with logo visible
    setStage(1);
    
    // Add text after a delay
    const timer1 = setTimeout(() => setStage(2), 1000);
    
    // Fade out everything
    const timer2 = setTimeout(() => {
      setStage(3);
      setTimeout(onComplete, 1000);
    }, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);
  
  return (
    <div className={`intro-animation stage-${stage}`}>
      <div className="intro-content">
        <div className="logo-container">
          <img 
            src={logoImage} 
            alt="EVident Battery" 
            className="intro-logo" 
          />
        </div>
        <div className="intro-text">
          <h1>Task Manager</h1>
          <div className="intro-tagline">Efficiently manage your workflow</div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm mb-6">
      <div className="flex items-center">
        <img 
          src={logoImage} 
          alt="EVident Battery" 
          className="h-10 object-contain" 
        />
      </div>
      <div className="flex space-x-6">
        <span className="text-gray-600 font-medium">Task Manager</span>
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
  const [showIntro, setShowIntro] = useState(true);
  
  // Animation will play every time the login page loads
  
  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // If user exists, don't show intro (only show on login screen)
  useEffect(() => {
    if (user) {
      setShowIntro(false);
    }
  }, [user]);

  if (showIntro && !user) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      {!user ? <Login /> : <Dashboard />}
    </div>
  );
}

export default App;