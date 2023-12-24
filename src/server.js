const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const PORT = process.env.PORT || 3000; // Ensure you use a port other than 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
