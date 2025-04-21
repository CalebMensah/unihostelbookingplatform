// routes/notificationRoutes.js
import express from "express";
import { deleteNotification, getNotifications, markNotificationAsRead } from "../controllers/notificationsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router()

router.get('/',verifyToken, getNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.delete('/:notificationId', deleteNotification);
 

export default router;