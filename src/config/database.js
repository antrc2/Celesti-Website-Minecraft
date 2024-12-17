import mysql2 from "mysql2"
import dotenv from 'dotenv';
dotenv.config();

const database = () => {
    const connect = mysql2.createConnection(
        {
            host: process.env.HOST,
            user:  process.env.USERNAME,
            password:  process.env.PASSWORD,
            database:  process.env.DBNAME
        }
    )
    return connect
}
export default database;