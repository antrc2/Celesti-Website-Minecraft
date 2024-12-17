import express from "express"
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT
import loadRoutes from './routes/index.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
loadRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})