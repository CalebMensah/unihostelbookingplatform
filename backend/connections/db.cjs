const dotenv = require("dotenv")
const { Pool } = require("pg");

dotenv.config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    options: {
        searchPath: ['public']
    }
}
)

pool.connect((err,client,release) => {
    if(err) {
        console.error(err)}
        console.log("Database connected successfully.")
})

module.exports = pool