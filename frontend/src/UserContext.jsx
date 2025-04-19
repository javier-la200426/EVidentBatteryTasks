import { createContext, useContext, useState } from "react";

const UserContext = createContext();

const mockUsers = [
  { id: "1", name: "Alice", role: "submitter" },
  { id: "2", name: "Bob", role: "approver" },
];

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userId) => {
    const found = mockUsers.find((u) => u.id === userId);
    setUser(found || null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, mockUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
