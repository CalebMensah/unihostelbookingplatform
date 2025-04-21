import pool from "../connections/db.cjs";
import cloudinary from "../utils/cloudinaryConfig.js";

// ✅ Add a room (With Multiple Images)
export const addRoom = async (req, res) => {
    const { hostel_id, floor, room_number, price, capacity, status } = req.body;

    try {
        console.log('Adding new room with data:', {
            body: req.body,
            files: req.files?.length || 0
        });

        const roomResult = await pool.query(
            "INSERT INTO rooms (hostel_id, floor, room_number, price, capacity, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id",
            [hostel_id, floor, room_number, price, capacity, status]
        );

        const room_id = roomResult.rows[0].id;
        console.log('Created room with ID:', room_id);

        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            try {
                console.log('Processing', req.files.length, 'room images');
                for (const file of req.files) {
                    console.log('Uploading file:', file.path);
                    const result = await cloudinary.uploader.upload(file.path, { 
                        folder: "rooms",
                        resource_type: "auto"
                    });
                    console.log('Cloudinary upload result:', result);
                    
                    await pool.query(
                        "INSERT INTO room_images (room_id, image_url) VALUES ($1, $2) RETURNING image_url",
                        [room_id, result.secure_url]
                    );
                    uploadedImages.push(result.secure_url);
                }
                console.log('All room images uploaded successfully');
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                // Delete the room if image upload fails
                await pool.query("DELETE FROM rooms WHERE id = $1", [room_id]);
                return res.status(500).json({ 
                    message: "Error uploading room images", 
                    error: uploadError.message,
                    details: "Please check your Cloudinary credentials in the .env file"
                });
            }
        } else {
            console.log('No room images to upload');
        }

        res.status(201).json({ 
            message: "Room added successfully", 
            room_id,
            uploadedImages 
        });
    } catch (error) {
        console.error("Error adding room:", error);
        res.status(500).json({ 
            message: "Error adding room", 
            error: error.message,
            details: "There was an error adding the room. Please try again."
        });
    }
};

// ✅ Get all rooms with images for a hostel (With Pagination)
export const getHostelRooms = async (req, res) => {
    const { hostel_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.query(
            `
            SELECT r.*, ARRAY_AGG(ri.image_url) AS images
            FROM rooms r
            LEFT JOIN room_images ri ON r.id = ri.room_id
            WHERE r.hostel_id = $1
            GROUP BY r.id
            ORDER BY r.created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [hostel_id, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rooms", error });
    }
};


// ✅ Update Room (With Image Replacement)
export const updateRoom = async (req, res) => {
    const { id } = req.params; // Room ID
    const { floor, room_number, price, capacity,status } = req.body;

    try {
        // Update room details
        const result = await pool.query(
            "UPDATE rooms SET floor = $2, room_number = $3, price = $4, capacity = $5, status = $6 WHERE id = $1 RETURNING *",
            [id, floor, room_number, price, capacity, status]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        // If new images are uploaded, delete old ones and insert new ones
        if (req.files && req.files.length > 0) {
            // Fetch existing images
            const existingImages = await pool.query("SELECT image_url FROM room_images WHERE room_id = $1", [id]);

            // Delete images from Cloudinary
            for (const img of existingImages.rows) {
                const publicId = img.image_url.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`rooms/${publicId}`);
            }

            // Delete images from DB
            await pool.query("DELETE FROM room_images WHERE room_id = $1", [id]);

            // Upload new images
            for (const file of req.files) {
                const uploadResult = await cloudinary.uploader.upload(file.path, { folder: "rooms" });
                await pool.query("INSERT INTO room_images (room_id, image_url) VALUES ($1, $2)", [id, uploadResult.secure_url]);
            }
        }

        res.json({ message: "Room updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating room", error });
    }
};

// ✅ Delete Room (Including Images)
export const deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch existing images
        const existingImages = await pool.query("SELECT image_url FROM room_images WHERE room_id = $1", [id]);

        // Delete images from Cloudinary
        for (const img of existingImages.rows) {
            const publicId = img.image_url.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`rooms/${publicId}`);
        }

        // Delete room from DB
        const result = await pool.query("DELETE FROM rooms WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting room", error });
    }
};


// get room by id
export const getRoomById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT r.*, ARRAY_AGG(ri.image_url) AS images
            FROM rooms r
            LEFT JOIN room_images ri ON r.id = ri.room_id
            WHERE r.id = $1
            GROUP BY r.id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error fetching room", error });
    }
};
