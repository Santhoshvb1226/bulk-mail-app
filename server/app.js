
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

app.use(express.json());
app.use(morgan('dev'));
app.use('/api/emails', require('./routes/emailRoutes'));

app.get('/', (req, res) => {
  res.send('Bulk Mail API is running!');
});
module.exports = app;
