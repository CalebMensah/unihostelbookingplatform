import express from "express";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { addRoom, deleteRoom, getRoomById, updateRoom, getHostelRooms } from "../controllers/roomsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles(["landlord"]),upload.array("images", 5), addRoom);
router.put("/:id", verifyToken, allowRoles(["landlord"]),upload.array("images", 5), updateRoom);
router.delete("/:id", verifyToken, allowRoles(["landlord"]),deleteRoom);
router.get("/:hostel_id", getHostelRooms);
router.get("/:id", verifyToken, getRoomById);

export default router;
