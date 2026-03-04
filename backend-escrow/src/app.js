//This file focuses on assembling your application.
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from '../modules/auth/auth.routes.js';
//import middleware, routes, but not database connection as will use it in serer .js file 
dotenv.config();

//init
const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',  // Vite default
  'http://localhost:8080',  // Alternative dev server
  'http://localhost:3000',  // If running on 3000
  process.env.FRONTEND_URL  // Custom frontend URL from env
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

//import global middleware

//import routes+
app.use('/auth', authRoutes);

///health 
app.get("/healthz",(req,res)=>{
    res.status(200).json({status:"ok"});
})
export default app;