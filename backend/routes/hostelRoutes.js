import express from "express";
import { addHostel, updateHostel, deleteHostel, getHostels, getManagerHostels, getHostelById, uploadLandlordDocuments, getHostelInfo, getLandlordHostel } from "../controllers/hostelController.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { body } from "express-validator";
import uploads from "../config/multer.js";

const router = express.Router();

export const validateHostel = [
    body("name").notEmpty().withMessage("Name is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("floors").isInt({min:1}).withMessage("Floors must be a positive integer"),
    body("amenities").isArray().withMessage("Amenities must be an array.")
]

router.post("/", verifyToken, allowRoles(["landlord"]),upload.array("images", 5), validateHostel,addHostel);
router.put("/:id", verifyToken, allowRoles(["landlord"]),upload.array("images", 5),updateHostel);
router.delete("/:id", verifyToken, allowRoles(["landlord"]),deleteHostel);
router.get("/", getHostels);
router.get("/manager", verifyToken, allowRoles(["landlord"]),getManagerHostels);
router.get("/:id", getHostelById);
router.post(
    "/upload-documents",
    uploads.fields([
        { name: "proofOfProperty", maxCount: 1 },
        { name: "utilityBills", maxCount: 1 },
        { name: "businessRegistration", maxCount: 1 },
    ]), verifyToken,allowRoles(["landlord"]),
    uploadLandlordDocuments
);
router.get("/:id/info", getHostelInfo)
router.get("/landlord/hostel", verifyToken, allowRoles(["landlord"]), getLandlordHostel)

export default router;