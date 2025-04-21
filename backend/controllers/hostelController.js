//import uploads from "../config/multer.js";
import pool from "../connections/db.cjs";
import cloudinary from "../utils/cloudinaryConfig.js";



// ✅ Add a new hostel (With Multiple Images)
export const addHostel = async (req, res) => {
    try {
        console.log('Adding new hostel with data:', {
            body: req.body,
            files: req.files?.length || 0,
            user: req.user.id
        });

        const { name, location, description, floors } = req.body;
        let amenities = [];
        
        try {
            amenities = JSON.parse(req.body.amenities || '[]');
        } catch (e) {
            console.error('Error parsing amenities:', e);
            amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [];
        }

        const manager_id = req.user.id;

        // First create the hostel
        const hostelResult = await pool.query(
            "INSERT INTO hostels (manager_id, name, location, description, floors, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id",
            [manager_id, name, location, description, floors]
        );

        const hostel_id = hostelResult.rows[0].id;
        console.log('Created hostel with ID:', hostel_id);

        // Handle image uploads if any
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            try {
                console.log('Processing', req.files.length, 'images');
                for (const file of req.files) {
                    console.log('Uploading file:', file.path);
                    const result = await cloudinary.uploader.upload(file.path, { 
                        folder: "hostels",
                        resource_type: "auto"
                    });
                    console.log('Cloudinary upload result:', result);
                    
                    await pool.query(
                        "INSERT INTO hostel_images (hostel_id, image_url) VALUES ($1, $2) RETURNING image_url", 
                        [hostel_id, result.secure_url]
                    );
                    uploadedImages.push(result.secure_url);
                }
                console.log('All images uploaded successfully');
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                // Delete the hostel if image upload fails
                await pool.query("DELETE FROM hostels WHERE id = $1", [hostel_id]);
                return res.status(500).json({ 
                    message: "Error uploading images", 
                    error: uploadError.message,
                    details: "Please check your Cloudinary credentials in the .env file"
                });
            }
        } else {
            console.log('No images to upload');
        }

        // Handle amenities
        const insertedAmenities = [];
        if (amenities && amenities.length > 0) {
            try {
                console.log('Processing amenities:', amenities);
                for (const amenity of amenities) {
                    const result = await pool.query(
                        "INSERT INTO hostel_amenities (hostel_id, amenity) VALUES ($1, $2) RETURNING amenity",
                        [hostel_id, amenity]
                    );
                    insertedAmenities.push(result.rows[0].amenity);
                }
                console.log('All amenities inserted:', insertedAmenities);
            } catch (amenityError) {
                console.error("Error adding amenities:", amenityError);
            }
        }

        // Return the complete hostel data
        const completeHostel = await pool.query(`
            SELECT h.*, 
                   COALESCE(ARRAY_AGG(DISTINCT ha.amenity) FILTER (WHERE ha.amenity IS NOT NULL), '{}') AS amenities,
                   COALESCE(ARRAY_AGG(DISTINCT hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images
            FROM hostels h
            LEFT JOIN hostel_amenities ha ON h.id = ha.hostel_id
            LEFT JOIN hostel_images hi ON h.id = hi.hostel_id
            WHERE h.id = $1
            GROUP BY h.id, h.manager_id, h.name, h.location, h.description, h.floors, h.created_at
        `, [hostel_id]);

        res.status(201).json({ 
            message: "Hostel added successfully", 
            hostel: completeHostel.rows[0],
            details: {
                uploadedImages,
                insertedAmenities
            }
        });
    } catch (error) {
        console.error("Error adding hostel:", error);
        res.status(500).json({ 
            message: "Error adding hostel", 
            error: error.message,
            details: "There was an error adding the hostel. Please try again."
        });
    }
};

// ✅ Get all hostels with images, pagination & search
export const getHostels = async (req, res) => {
    const { page = 1, limit = 10, search, location, minPrice, maxPrice, amenities } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT h.*, 
                   COALESCE(ARRAY_AGG(DISTINCT ha.amenity) FILTER (WHERE ha.amenity IS NOT NULL), '{}') AS amenities,
                   COALESCE(ARRAY_AGG(DISTINCT hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images 
            FROM hostels h 
            LEFT JOIN hostel_amenities ha ON h.id = ha.hostel_id
            LEFT JOIN hostel_images hi ON h.id = hi.hostel_id
            WHERE 1=1
        `;
        let values = [];
        let paramIndex = 1;

        if (search) {
            query += " AND (h.name ILIKE $1 OR h.location ILIKE $1)";
            values.push(`%${search}%`);
            paramIndex++;
        }
        if (location) {
            query += ` AND h.location ILIKE $${paramIndex}`;
            values.push(`%${location}%`);
            paramIndex++;
        }
        if (minPrice) {
            query += ` AND h.price >= $${paramIndex}`;
            values.push(minPrice);
            paramIndex++;
        }
        if (maxPrice) {
            query += ` AND h.price <= $${paramIndex}`;
            values.push(maxPrice);
            paramIndex++;
        }
        if (amenities) {
            const amenityList = amenities.split(',');
            query += ` AND ha.amenity IN (${amenityList.map((_, i) => `$${paramIndex + i}`).join(',')})`;
            values.push(...amenityList);
            paramIndex += amenityList.length;
        }

        query += " GROUP BY h.id, h.manager_id, h.name, h.location, h.description, h.floors, h.created_at ORDER BY h.created_at DESC LIMIT $" + paramIndex + " OFFSET $" + (paramIndex + 1);
        values.push(limit, offset);

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching hostels:", error);
        res.status(500).json({ 
            message: "Error fetching hostels", 
            error: error.message,
            details: "There was an error retrieving the hostels. Please try again."
        });
    }
};

// ✅ Update Hostel Details (With Image Replacement)
export const updateHostel = async (req, res) => {
    const { id } = req.params; // Hostel ID
    const { name, location, description, floors } = req.body;
    const manager_id = req.user.id;

    try {
        // Update hostel details
        const result = await pool.query(
            "UPDATE hostels SET name = $2, location = $3, description = $4, floors = $5 WHERE id = $1 AND manager_id = $6 RETURNING *",
            [id, name, location, description, floors, manager_id]
        );

        // Update amenities
        await pool.query("DELETE FROM hostel_amenities WHERE hostel_id = $1", [id]);
        if (req.body.amenities && req.body.amenities.length > 0) {
            for (const amenity of req.body.amenities) {
                await pool.query(
                    "INSERT INTO hostel_amenities (hostel_id, amenity) VALUES ($1, $2)",
                    [id, amenity]
                );
            }
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Hostel not found or unauthorized" });
        }

        // If new images are uploaded, delete old ones and insert new ones
        if (req.files && req.files.length > 0) {
            // Fetch existing images from DB
            const existingImages = await pool.query("SELECT image_url FROM hostel_images WHERE hostel_id = $1", [id]);

            // Delete images from Cloudinary
            for (const img of existingImages.rows) {
                const publicId = img.image_url.split("/").pop().split(".")[0]; // Extract Cloudinary Public ID
                await cloudinary.uploader.destroy(`hostels/${publicId}`);
            }

            // Delete images from DB
            await pool.query("DELETE FROM hostel_images WHERE hostel_id = $1", [id]);

            // Upload new images
            for (const file of req.files) {
                const uploadResult = await cloudinary.uploader.upload(file.path, { folder: "hostels" });
                await pool.query("INSERT INTO hostel_images (hostel_id, image_url) VALUES ($1, $2)", [id, uploadResult.secure_url]);
            }
        }

        res.json({ message: "Hostel updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating hostel", error });
    }
};

// ✅ Delete Hostel (Including Images)
export const deleteHostel = async (req, res) => {
    const { id } = req.params;
    const manager_id = req.user.id;

    try {
        // Fetch existing images from DB
        const existingImages = await pool.query("SELECT image_url FROM hostel_images WHERE hostel_id = $1", [id]);

        // Delete images from Cloudinary
        for (const img of existingImages.rows) {
            const publicId = img.image_url.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`hostels/${publicId}`);
        }

        // Delete hostel from DB (Cascade deletes rooms & images)
        const result = await pool.query("DELETE FROM hostels WHERE id = $1 AND manager_id = $2 RETURNING *", [id, manager_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Hostel not found or unauthorized" });
        }

        res.json({ message: "Hostel deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting hostel", error });
    }
};

// get manager hostel for a specific manager
export const getManagerHostels = async (req, res) => {
    const manager_id = req.user.id;

    try {
        console.log("Fetching hostels for manager:", manager_id);
        const result = await pool.query(`
            SELECT h.*, 
                   COALESCE(ARRAY_AGG(DISTINCT ha.amenity) FILTER (WHERE ha.amenity IS NOT NULL), '{}') AS amenities,
                   COALESCE(ARRAY_AGG(DISTINCT hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images
            FROM hostels h
            LEFT JOIN hostel_amenities ha ON h.id= ha.hostel_id
            LEFT JOIN hostel_images hi ON h.id = hi.hostel_id
            WHERE h.manager_id = $1
            GROUP BY h.id, h.manager_id, h.name, h.location, h.description, h.floors, h.created_at`,
            [manager_id]
        );

        console.log("Found hostels:", result.rows.length);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching hostels:", error);
        res.status(500).json({ 
            message: "Error fetching hostels", 
            error: error.message,
            details: "If this is your first time, you may not have any hostels listed yet. Try adding a hostel first."
        });
    }
};

// get hostel by id
export const getHostelById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT 
                h.*,
                COALESCE(ARRAY_AGG(DISTINCT ha.amenity) FILTER (WHERE ha.amenity IS NOT NULL), '{}') AS amenities,
                COALESCE(ARRAY_AGG(DISTINCT hi.image_url) FILTER (WHERE hi.image_url IS NOT NULL), '{}') AS images,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', r.id,
                            'floor', r.floor,
                            'room_number', r.room_number,
                            'price', r.price,
                            'capacity', r.capacity,
                            'status', r.status,
                            'current_occupancy', (
                                SELECT COUNT(*)
                                FROM bookings b
                                WHERE b.room_id = r.id
                                AND r.status = 'active'
                                AND NOW() BETWEEN b.start_date AND b.end_date
                            ),
                            'images', (
                                SELECT COALESCE(ARRAY_AGG(ri.image_url), '{}')
                                FROM room_images ri
                                WHERE ri.room_id = r.id
                            )
                        )
                    ) FILTER (WHERE r.id IS NOT NULL),
                    '[]'
                ) AS rooms
            FROM hostels h
            LEFT JOIN hostel_amenities ha ON h.id = ha.hostel_id
            LEFT JOIN hostel_images hi ON h.id = hi.hostel_id
            LEFT JOIN rooms r ON h.id = r.hostel_id
            WHERE h.id = $1
            GROUP BY h.id, h.manager_id, h.name, h.location, h.description, h.floors, h.created_at`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Hostel not found" });
        }

        // Log the response for debugging
        console.log('Hostel data with rooms and occupancy:', result.rows[0]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching hostel:", error);
        res.status(500).json({ 
            message: "Error fetching hostel", 
            error: error.message,
            details: "There was an error retrieving the hostel details. Please try again."
        });
    }
};

// Retry logic for Cloudinary uploads
const retryUpload = async (fileBuffer,mimetype, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const base64String = `data:${mimetype};base64,${fileBuffer.toString("base64")}`
            // Directly upload the file buffer to Cloudinary
            const result = await cloudinary.uploader.upload(base64String, {
                resource_type: "auto", // Automatically detect file type
                folder: "landlord_documents", // Optional: Specify a folder in Cloudinary
            });
            console.log("retry upload result:", result)
            if(!result || !result.secure_url) {
                throw new Error("Invalid cloudinary response: secure_url is missing");
            }
            return {secure_url: result.secure_url}
        } catch (error) {
            if (attempt === retries) throw error;
            console.log(`Retrying upload... Attempt ${attempt}`);
        }
    }
};

export const uploadLandlordDocuments = async (req, res) => {
    const landlord_id = req.user.userid;
    const manager_id = req.user.id;
    try {
        const {
            documentType,
            id_number,
            bank_name,
            account_number,
            account_type,
            account_name,
        } = req.body;
        console.log("Request body from landlord details:", req.body);
        const files = req.files;

        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const allowedFormats = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        const maxFileSize = 5 * 1024 * 1024;
        for(const [key, fileArray] of Object.entries(files)) {
            const file = fileArray[0];
            if (!allowedFormats.includes(file.mimetype)) {
                return res.status(400).json({ message: `Invalid file format for ${key}. Allowed formats JPEG,JPG,PDF`})
            }
            if(file.size > maxFileSize) {
                return res.status(400).json({ message: `File size for ${key} exceeds the limit of 5MB`})
            }
        }

        // Upload files to Cloudinary
        const uploadPromises = Object.keys(files).map(async (key) => {
            const file = files[key][0];
            const result = await retryUpload(file.buffer, file.mimetype); // Pass the buffer directly
            if(!result.secure_url) {
                throw new Error(`Failed to upload file: ${key}`)
            }
            return { [key]: result.secure_url };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        const fileUrls = uploadedFiles.reduce((acc, curr) => ({ ...acc, ...curr }), {});


        const query = `
        INSERT INTO landlord_documents (
            document_type,
            id_number,
            proof_of_property,
            utility_bills,
            business_registration,
            landlord_id,
            manager_id,
            bank_name,
            account_number,
            account_type,
            account_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
    `;
    const values = [
        documentType,
        id_number,
        fileUrls.proofOfProperty,
        fileUrls.utilityBills,
        fileUrls.businessRegistration,
        landlord_id,
        manager_id,
        bank_name,         // Directly insert into the bank_name column
        account_number,    // Directly insert into the account_number column
        account_type,      // Directly insert into the account_type column
        account_name    // Directly insert into the account_name column
    ];

        const result = await pool.query(query, values);
        return res.status(201).json({ message: "Documents uploaded successfully", data: result.rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const getHostelInfo = async (req, res) => {
    const { id } = req.params;
  
    try {
      const hostelInfoResult = await pool.query(
        `
        SELECT 
          id, name, location,
          (SELECT AVG(rating) FROM reviews WHERE hostel_id = $1) AS average_rating,
          (SELECT COUNT(*) FROM reviews WHERE hostel_id = $1) AS total_reviews
        FROM hostels
        WHERE id = $1
        `,
        [id]
      );

      const hostelInfo = hostelInfoResult.rows[0]

      const imageResult = await pool.query(
        `
        SELECT image_url
        FROM hostel_images
        WHERE hostel_id = $1
        ORDER BY id ASC
        LIMIT 1
        `, [id]
      );
      const imageURL = imageResult.rows[0]
  
      res.json({
        ...hostelInfo,
        image:imageURL
      });
    } catch (error) {
      console.error("Error fetching hostel info:", error);
      res.status(500).json({ error: "Failed to load hostel info" });
    }
  };


export const getLandlordHostel = async (req, res) => {
  try {
    // Extract landlord ID from request (e.g., via authentication)
    const landlordId = req.user.id; // Assuming the landlord ID is available in the authenticated user object

    // Query to fetch the landlord's hostel(s)
    const query = `
      SELECT 
        h.id AS hostel_id,
        h.name AS hostel_name,
        h.location AS hostel_location,
        ARRAY_AGG(DISTINCT ha.amenity) AS amenities,
        COUNT(r.id) FILTER (WHERE r.status = 'available') AS available_rooms,
        COUNT(r.id) AS total_rooms,
        hi.image_url AS image_url,
        h.verification_status AS hostel_status
      FROM 
        hostels h
      LEFT JOIN 
        hostel_images hi ON h.id = hi.hostel_id
      LEFT JOIN 
        rooms r ON h.id = r.hostel_id
      LEFT JOIN 
        hostel_amenities ha ON h.id = ha.hostel_id
      WHERE 
        h.manager_id = $1
      GROUP BY 
        h.id, hi.image_url
      ORDER BY 
        h.id;
    `;

    // Execute the query
    const { rows } = await pool.query(query, [landlordId]);

    // Transform the result into the desired format
    const hostels = rows.map((row) => ({
      id: row.hostel_id,
      name: row.hostel_name,
      location: row.hostel_location,
      amenities: row.amenities.filter(Boolean), // Remove null values
      availableRooms: parseInt(row.available_rooms, 10),
      totalRooms: parseInt(row.total_rooms, 10),
      imageUrl: row.image_url || '/api/placeholder/300/200', // Default image if none exists
      rentPerMonth: parseFloat(row.rent_per_month),
      status: row.hostel_status,
    }));

    // Send the response
    return res.status(200).json({
      success: true,
      data: hostels.length === 1 ? hostels[0] : hostels, // Return single hostel or array if multiple
    });
  } catch (error) {
    console.error('Error fetching landlord hostel:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};