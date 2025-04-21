import express from 'express'
import { checkEmailVerification, verifyEmail, requestVerificationEmail } from '../controllers/emailVerificationsController.js'


const router = express.Router()

router.get('/verify-email/:token', verifyEmail)
router.get('/verification-status', checkEmailVerification)
router.post('/request-verification-email', requestVerificationEmail)

export default router
