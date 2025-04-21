import express from "express";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import {  getAllContactMessages, getAllDocuments, getAllHostels, getAllUsers, submitContactForm, updateVerificationStatus } from "../controllers/adminController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router()

router.get("/documents",  getAllDocuments)
router.post("/verify-document", updateVerificationStatus)
router.get("/users", getAllUsers)
router.get("/hostels", getAllHostels)
router.post("/contact", verifyToken, submitContactForm)
router.get("/contact", getAllContactMessages)
export default router;