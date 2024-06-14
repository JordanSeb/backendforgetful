const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongodb = require('mongodb');

const app = express();
const port = process.env.PORT || 10000;
app.use(bodyParser.json());
app.use(cors());

const MongoClient = mongodb.MongoClient;
const url = 'mongodb+srv://jordaneg117:T1QFEpHNxvhCBo5T@forgetfulapp.02ixfqq.mongodb.net/?retryWrites=true&w=majority&appName=forgetfulapp'; // Cambia la URL si MongoDB está en otro lugar
const dbName = 'forgetful'; // Nombre de tu base de datos

let db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión establecida a la base de datos');
  db = client.db(dbName);
});

// Crear un nuevo recordatorio
app.post('/reminders', (req, res) => {
  const { userId, name, date, total, details } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  const collection = db.collection('reminders');
  const reminder = {
    userId,
    name,
    date,
    total,
    details
  };
  collection.insertOne(reminder, (err, result) => {
    if (err) {
      console.error('Error al insertar el recordatorio:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(result.ops[0]);
  });
});

// Obtener todos los recordatorios de un usuario
app.get('/reminders', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  const collection = db.collection('reminders');
  collection.find({ userId }).toArray((err, reminders) => {
    if (err) {
      console.error('Error al obtener los recordatorios:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(reminders);
  });
});

// Actualizar un recordatorio existente
app.put('/reminders/:id', (req, res) => {
  const { id } = req.params;
  const { userId, name, date, total, details } = req.body;
  const collection = db.collection('reminders');
  collection.findOneAndUpdate(
    { _id: new mongodb.ObjectID(id), userId },
    { $set: { name, date, total, details } },
    { returnOriginal: false },
    (err, result) => {
      if (err) {
        console.error('Error al actualizar el recordatorio:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      if (!result.value) {
        res.status(404).json({ error: 'Reminder not found' });
        return;
      }
      res.json(result.value);
    }
  );
});

// Eliminar un recordatorio
app.delete('/reminders/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const collection = db.collection('reminders');
  collection.findOneAndDelete(
    { _id: new mongodb.ObjectID(id), userId },
    (err, result) => {
      if (err) {
        console.error('Error al eliminar el recordatorio:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      if (!result.value) {
        res.status(404).json({ error: 'Reminder not found' });
        return;
      }
      res.json(result.value);
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://192.168.1.100:${port}/`);  // Reemplaza con tu IP local
});
