import express from "express"
const app = express();
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT
import apiRoutes from "./routes/api.js"

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v0",apiRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})