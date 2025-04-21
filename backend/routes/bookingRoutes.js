import { cancelBooking, createBooking, deleteBooking, getLandlordBookings, getManagerBookings, getStudentBooking, getStudentBookings } from "../controllers/bookingsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import express from 'express'

const router = express.Router()

// Only landlords can access these bookings
router.get("/manager", verifyToken, allowRoles(["landlord"]), getManagerBookings);
router.post("/", verifyToken, createBooking);
router.get("/student", verifyToken, allowRoles(["student"]), getStudentBookings)
router.delete("/:id", verifyToken, deleteBooking)
router.get("/student-booking", verifyToken,allowRoles(["student"]), getStudentBooking)
router.get("/landlord-bookings", verifyToken,allowRoles(["landlord"]), getLandlordBookings)
router.post("/cancel-booking", verifyToken, allowRoles(["student"]), cancelBooking)

export default router