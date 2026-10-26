const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware to serve your HTML page statically and parse incoming client JSON strings
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions for persistent File I/O
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error("Error reading storage file:", error);
        return [];
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to storage file:", error);
    }
};

// 1. GET /api/items — Retrieve all records
app.get('/api/items', (req, res) => {
    const items = readData();
    res.status(200).json(items);
});

// 2. GET /api/items/:id — Retrieve one record by ID
app.get('/api/items/:id', (req, res) => {
    const items = readData();
    const item = items.find(i => i.id === req.params.id);
    
    if (!item) {
        return res.status(404).json({ message: 'Record not found.' });
    }
    res.status(200).json(item);
});

// 3. POST /api/items — Insert a new record
app.post('/api/items', (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ message: 'Missing title or description fields.' });
    }

    const items = readData();
    const newItem = {
        id: Date.now().toString(), // Clean string-based ID to cleanly align with deleteRecord('${item.id}')
        title,
        description
    };

    items.push(newItem);
    writeData(items);

    res.status(201).json(newItem);
});

// 4. DELETE /api/items/:id — Delete a record by ID
app.delete('/api/items/:id', (req, res) => {
    let items = readData();
    const initialLength = items.length;

    items = items.filter(i => i.id !== req.params.id);

    if (items.length === initialLength) {
        return res.status(404).json({ message: 'Record not found.' });
    }

    writeData(items);
    res.status(200).json({ message: 'Record deleted successfully.' });
});

// Fire up the instance
app.listen(PORT, () => {
    console.log(`Server executing live at: http://localhost:${PORT}`);
});
