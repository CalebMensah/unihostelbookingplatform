import express from 'express'
import { body } from 'express-validator'
import { forgotPassword, getAllStudentsInAHostel, getLandlordProfile, getStudentProfileInformation, loginUser, registerUser, resetPassword, updateStudentProfile } from '../controllers/authController.js'
import { authLimiter } from '../utils/authLimiter.js'
import { verifyToken } from '../middlewares/authMiddleware.js'
import { allowRoles } from '../middlewares/roleMiddleware.js'


const validateSignUp = [
    body("firstName").trim().isLength({ min: 3 }).withMessage("First Name is required"),
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body("phone").trim().matches(/^[0-9]{10}$/).withMessage("Invalid phone number"),
    body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Must include an uppercase letter")
    .matches(/\d/)
    .withMessage("Must include a number")
    .matches(/[!@#$^&*]/)
    .withMessage("Must include a special character"),
    body("role").isIn(["student", "landlord", "admin"]).withMessage("Invalid role")
]

const validateResetPassword = [
    body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Must include an uppercase letter")
    .matches(/\d/)
    .withMessage("Must include a number")
    .matches(/[!@#$^&*]/)
    .withMessage("Must include a special character")
]

const router = express.Router()

router.post("/register", authLimiter, validateSignUp, registerUser)
router.post("/login", loginUser)
router.post("/reset-password/:token", validateResetPassword, resetPassword)
router.post("/forgot-password", forgotPassword)
router.get("/users", getAllStudentsInAHostel)
router.get("/student", verifyToken, allowRoles(["student"]), getStudentProfileInformation)
router.put("/student", authLimiter, validateSignUp, verifyToken, updateStudentProfile)
router.get("/landlord", verifyToken, allowRoles(["landlord"]) ,getLandlordProfile)


export default router
