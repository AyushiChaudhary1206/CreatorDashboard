const express=require("express");
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');


dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());
const connectDB = require("./db"); 
connectDB();
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
