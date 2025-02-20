import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URl
})

export default pool