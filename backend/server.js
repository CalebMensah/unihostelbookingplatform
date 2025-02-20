import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())

const PORT = process.env.PORT
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))