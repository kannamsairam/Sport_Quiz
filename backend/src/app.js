const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
//const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

connectDB();

app.use(cors());
app.use(express.json());

//app.use('/api/auth', authRoutes);
app.use('/api', quizRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));