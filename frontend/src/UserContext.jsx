import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

const mockUsers = [
  { id: "1", name: "Chenwei Wu", role: "submitter" },
  { id: "2", name: "Jinqiang Ning", role: "approver" },
];

function createMockJWT(user) {
  const payload = btoa(JSON.stringify(user)); // base64 encode
  return `mockheader.${payload}.mocksignature`;
}

function decodeMockJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userId) => {
    const found = mockUsers.find((u) => u.id === userId);
    if (found) {
      const token = createMockJWT(found);
      localStorage.setItem("token", token);
      setUser(found);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeMockJWT(token);
      if (decoded) setUser(decoded);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, mockUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
export { UserContext };
