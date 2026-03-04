//This file focuses on assembling your application.
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from '../modules/auth/auth.routes.js';
//import middleware, routes, but not database connection as will use it in serer .js file 
dotenv.config();

//init
const app = express();
app.use(express.json());

//import global middleware

//import routes+
app.use('/auth', authRoutes);

///health 
app.get("/healthz",(req,res)=>{
    res.status(200).json({status:"ok"});
})
export default app;