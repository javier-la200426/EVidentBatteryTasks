const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes); // Automatically handles /api/tasks/...

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
