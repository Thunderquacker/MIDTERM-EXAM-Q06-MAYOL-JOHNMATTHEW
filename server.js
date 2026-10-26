const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static('public'));


function readTickets() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}


function writeTickets(tickets) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tickets, null, 2), 'utf8');
}


app.get('/api/tickets', (req, res) => {
  const tickets = readTickets();
  res.status(200).json(tickets);
});


app.get('/api/tickets/:id', (req, res) => {
  const tickets = readTickets();
  const ticket = tickets.find(t => String(t.id) === String(req.params.id));
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found.' });
  }
  res.status(200).json(ticket);
});


app.post('/api/tickets', (req, res) => {
  const { customer_name, problem, priority } = req.body;

  if (!customer_name || !problem || !priority) {
    return res.status(400).json({ 
      message: 'customer_name, problem, and priority are required fields.' 
    });
  }

  const tickets = readTickets();
  const newTicket = {
    id: Date.now().toString(),
    customer_name,
    problem,
    priority,
    status: 'Pending' 
  };

  tickets.push(newTicket);
  writeTickets(tickets);

  res.status(201).json(newTicket);
});


app.delete('/api/tickets/:id', (req, res) => {
  let tickets = readTickets();
  const index = tickets.findIndex(t => String(t.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Ticket not found.' });
  }

  const deletedTicket = tickets.splice(index, 1)[0];
  writeTickets(tickets);

  res.status(200).json({ 
    message: 'Ticket deleted successfully.', 
    ticket: deletedTicket 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
