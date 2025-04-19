import { useUser } from "./UserContext";

export default function Login() {
  const { login, mockUsers } = useUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Select a User to Login</h1>
      <select
        className="p-2 border rounded"
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
  );
}
