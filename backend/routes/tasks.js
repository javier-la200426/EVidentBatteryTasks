const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { createdBy, status, role } = req.query;

  if (!role) {
    return res.status(400).json({ error: "Missing role in query" });
  }

  let query = `
    SELECT tasks.*, users.name as creatorName, task_order.position
    FROM tasks
    LEFT JOIN users ON tasks.createdBy = users.id
    LEFT JOIN task_order ON task_order.taskId = tasks.id AND task_order.role = ?
    WHERE 1=1
  `;
  let params = [role];

  if (createdBy) {
    query += ' AND createdBy = ?';
    params.push(createdBy);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY task_order.position ASC';

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});


// POST /api/tasks — create a task
router.post('/', (req, res) => {
  const { id, title, description, createdAt, createdBy } = req.body;
  console.log("in task/post");
  console.log("🔸 Received task body:", req.body);

  try {
    // Get the current max position so the new task goes to the end
    const max = db.prepare("SELECT MAX(position) as max FROM tasks").get().max || 0;
    console.log("🔹 Current max position:", max);

    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, createdAt, createdBy, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, description, 'pending', createdAt, createdBy, max + 1);

    res.status(201).json({ message: 'Task added' });
  } catch (err) {
    console.error("❌ Error in POST /api/tasks:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (task.createdBy !== userId || task.status !== "pending") {
    return res.status(403).json({ error: "Not allowed to delete this task" });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(200).json({ message: "Task deleted" });
});

// PUT /api/tasks/:id — edit task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, userId } = req.body;

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (
    task.createdBy !== userId ||
    (task.status !== "pending" && task.status !== "done")
  ) {
    return res.status(403).json({ error: "Not allowed to delete this task" });
  }
  

  db.prepare(`
    UPDATE tasks SET title = ?, description = ? WHERE id = ?
  `).run(title, description, id);

  res.status(200).json({ message: "Task updated" });
});

// PATCH /api/tasks/:id/status — update status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "approved", "rejected", "done"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
  res.status(200).json({ message: "Status updated" });
});

// PATCH /api/tasks/reorder — update positions
router.patch('/reorder', (req, res) => {
  const { orderedIds, role } = req.body;

  try {
    const deleteOld = db.prepare(`DELETE FROM task_order WHERE role = ?`);
    deleteOld.run(role);

    const insert = db.prepare(`INSERT INTO task_order (role, taskId, position) VALUES (?, ?, ?)`);
    orderedIds.forEach((id, index) => {
      insert.run(role, id, index);
    });

    res.status(200).json({ message: "Order updated for role" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
