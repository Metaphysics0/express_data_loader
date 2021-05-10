require('dotenv').config();
const express = require('express');
const mongoUtil = require('./database/mongodb');

// App
const app = express();
app.get('/', (req, res) => {
  res.send('City Hive is the best!');
});

// routes
app.use('/api', require('./routes/routes'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
