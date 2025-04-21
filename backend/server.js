import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import emailRoutes from './routes/verifyEmailRoutes.js'
import hostelRoutes from './routes/hostelRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import notificationRoutes from './routes/notificationsRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())

//Routes
app.use("/api/auth", authRoutes)
app.use("/api/", emailRoutes)
app.use('/api/hostels', hostelRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/review', reviewRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/notifications", notificationRoutes)

const PORT = process.env.PORT
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))