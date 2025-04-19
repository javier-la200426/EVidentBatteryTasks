const Database = require('better-sqlite3');
const db = new Database('data.db');

// Create tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    status TEXT,
    createdAt TEXT,
    createdBy TEXT
  );
`);

// ✅ Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT
  );
`);

// ✅ Seed users (Alice the submitter, Bob the approver)
const users = [
  { id: "1", name: "Alice", role: "submitter" },
  { id: "2", name: "Bob", role: "approver" },
];

const insert = db.prepare("INSERT OR IGNORE INTO users (id, name, role) VALUES (?, ?, ?)");

for (const user of users) {
  insert.run(user.id, user.name, user.role);
}

module.exports = db;
