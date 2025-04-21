import express from "express";
import {  getUserPayments, getBookingPayments, payStackInitController, verifyPayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/initialize", payStackInitController)
router.get("/user",verifyToken,allowRoles(["student"]), getUserPayments);
router.get("/booking/:booking_id", getBookingPayments);
//router.post("/webhook",payStackWebhook)
router.get("/verify", verifyPayment)

export default router;
