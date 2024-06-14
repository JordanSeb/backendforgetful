const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

let reminders = [];

app.get('/', (req, res) => {
  res.send('API is running');
});

app.post('/reminders', (req, res) => {
  const { userId, name, date, total, details } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  const reminder = {
    id: reminders.length + 1,
    userId,
    name,
    date,
    total,
    details
  };
  reminders.push(reminder);
  res.json(reminder);
});

app.get('/reminders', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  const userReminders = reminders.filter(reminder => reminder.userId === userId);
  res.json(userReminders);
});

app.put('/reminders/:id', (req, res) => {
  const { id } = req.params;
  const { userId, name, date, total, details } = req.body;
  const reminderIndex = reminders.findIndex(reminder => reminder.id === parseInt(id));
  if (reminderIndex === -1) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  if (reminders[reminderIndex].userId !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  reminders[reminderIndex] = { ...reminders[reminderIndex], name, date, total, details };
  res.json(reminders[reminderIndex]);
});

app.delete('/reminders/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const reminderIndex = reminders.findIndex(reminder => reminder.id === parseInt(id));
  if (reminderIndex === -1) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  if (reminders[reminderIndex].userId !== userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const deletedReminder = reminders.splice(reminderIndex, 1);
  res.json(deletedReminder[0]);
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
