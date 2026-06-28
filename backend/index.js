import express, { text } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import contractRoutes from './routes/contractRoutes.js';
import vinRoutes from './routes/vinRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';


dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;


//Middlewares
app.use(cors());
app.use(express.json());


// Register Api route
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/vin', vinRoutes);
app.use('/api/chat', chatRoutes);


//Testing route
app.get('/', (req, res) => {
    res.send("Ai car lease assistand api is running...");
})


app.listen(PORT, () => {
    console.log(`Server is running on the port :  ${PORT} `);
})