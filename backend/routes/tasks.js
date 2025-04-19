const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {
  const { createdBy, status } = req.query;

  let query = `
    SELECT tasks.*, users.name as creatorName
    FROM tasks
    LEFT JOIN users ON tasks.createdBy = users.id
    WHERE 1=1
  `;
  let params = [];

  if (createdBy) {
    query += ' AND createdBy = ?';
    params.push(createdBy);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});




// POST /api/tasks — create a task
router.post('/', (req, res) => {
  const { id, title, description, createdAt, createdBy } = req.body;
  console.log("in task/post")

  try {
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, createdAt, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, description, 'pending', createdAt, createdBy);

    res.status(201).json({ message: 'Task added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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

//edit route
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, userId } = req.body;

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (task.createdBy !== userId || task.status !== "pending") {
    return res.status(403).json({ error: "Not allowed to edit this task" });
  }

  db.prepare(`
    UPDATE tasks SET title = ?, description = ? WHERE id = ?
  `).run(title, description, id);

  res.status(200).json({ message: "Task updated" });
});

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



module.exports = router;
