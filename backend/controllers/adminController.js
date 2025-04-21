// controllers/adminController.js
import pool from "../connections/db.cjs";

export const updateVerificationStatus = async (req, res) => {
    try {
        const { documentId, status } = req.body;

        // Validate status
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Find the document by ID
        const documentQuery = `
            SELECT manager_id 
            FROM landlord_documents 
            WHERE id = $1;
        `;
        const documentResult = await pool.query(documentQuery, [documentId]);
        if (documentResult.rows.length === 0) {
            return res.status(404).json({ message: "Document not found" });
        }
        const manager_id = documentResult.rows[0].manager_id;
        console.log("manager id:",manager_id)

        const existingVerificationQuery =`
        SELECT verification_status
        FROM hostels
        WHERE manager_id = $1
        `;

        const existingVerificationResults = await pool.query(existingVerificationQuery, [manager_id]);
        const verificationStatus = existingVerificationResults.rows[0].verification_status;
        if(verificationStatus === "approved") {
            return res.status(400).json({ message: "Hostel is already approves"})
        }

        // Update the verification status in the hostel table
        const hostelQuery = `
            UPDATE hostels 
            SET verification_status = $1 
            WHERE manager_id = $2 
            RETURNING *;
        `;
        const hostelResult = await pool.query(hostelQuery, [status, manager_id]);
        if (hostelResult.rows.length === 0) {
            return res.status(404).json({ message: "Hostel not found" });
        }

        // Optionally, log the action or notify the landlord

                // Notification logic for landlord
                try {
          
                  if (!manager_id) {
                    console.error(`Landlord not found for booking_id: ${booking_id}`);
                    return res.status(400).json({ message: "Landlord not found" });
                  }
          
                  // Insert notification for landlord
                  await pool.query(
                    `INSERT INTO notifications (landlord_id, type, title, message, is_read)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                      manager_id,
                      "Hostel verification",
                      "Hostel verification status",
                      `Your hostel has been ${status}.`,
                      false, // is_read
                    ]
                  );
                } catch (error) {
                  console.error("Error inserting notification:", error);
                }




        return res.status(200).json({ message: `Document ${status} successfully` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllDocuments = async (req, res) => {
    try {
        const query = `
            SELECT * 
            FROM landlord_documents;
        `;
        const result = await pool.query(query);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




// Function to sanitize sort column to prevent SQL injection
function sanitizeSortColumn(column, tableAlias) {
    const allowedColumns = [
        'id', 'firstname', 'lastname', 'email', 'phone',
        'hostel_name', 'location'
    ];

    // Map column to correct table column
    const columnMap = {
        'hostel_name': 'h.name',
        'location': 'h.location'
    };

    // Validate and map column
    const sanitizedColumn = allowedColumns.includes(column)
        ? (columnMap[column] || `${tableAlias}.${column}`)
        : `${tableAlias}.id`;

    return sanitizedColumn;
}

// Function to sanitize sort order
function sanitizeSortOrder(order) {
    return order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
}

// Function to remove total count column from results
function removeCountColumn(row) {
    const { total_students, total_landlords, ...rest } = row;
    return rest;
}

export const getAllUsers = async (req, res) => {
    try {
        // Extract query parameters with defaults
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'id',
            sortOrder = 'asc'
        } = req.query;

        // Validate and sanitize inputs
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Sanitize search input
        const sanitizedSearch = search.toString().trim().toLowerCase();

        // Students query with pagination and search
        const studentsQuery = `
            SELECT 
                userid, 
                firstname, 
                lastname, 
                email, 
                phone,
                COUNT(*) OVER() AS total_students
            FROM users 
            WHERE 
                role = 'student' AND 
                (
                    LOWER(firstname) LIKE $1 OR 
                    LOWER(lastname) LIKE $1 OR 
                    LOWER(email) LIKE $1
                )
            ORDER BY 
                ${sanitizeSortColumn(sortBy, 'users')} ${sanitizeSortOrder(sortOrder)}
            LIMIT $2 OFFSET $3;
        `;

        // Landlords query with pagination, search, and hostel details
        const landlordsQuery = `
            SELECT 
                u.id, 
                u.firstname, 
                u.lastname, 
                u.email, 
                u.phone, 
                h.name AS hostel_name, 
                h.location,
                COUNT(*) OVER() AS total_landlords
            FROM 
                users u
            LEFT JOIN 
                hostels h ON u.id = h.manager_id
            WHERE 
                u.role = 'landlord' AND 
                (
                    LOWER(u.firstname) LIKE $1 OR 
                    LOWER(u.lastname) LIKE $1 OR 
                    LOWER(u.email) LIKE $1 OR 
                    LOWER(h.name) LIKE $1 OR 
                    LOWER(h.location) LIKE $1
                )
            ORDER BY 
                ${sanitizeSortColumn(sortBy, 'u')} ${sanitizeSortOrder(sortOrder)}
            LIMIT $2 OFFSET $3;
        `;

        // Search parameter for LIKE query
        const searchParam = `%${sanitizedSearch}%`;

        // Execute queries
        const studentsResult = await pool.query(studentsQuery, [
            searchParam,
            limitNum,
            offset
        ]);

        const landlordsResult = await pool.query(landlordsQuery, [
            searchParam,
            limitNum,
            offset
        ]);

        // Calculate total pages
        const totalStudents = studentsResult.rows[0]?.total_students || 0;
        const totalLandlords = landlordsResult.rows[0]?.total_landlords || 0;

        // Return paginated results
        return res.status(200).json({
            students: {
                data: studentsResult.rows.map(removeCountColumn),
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalStudents / limitNum),
                    totalItems: totalStudents,
                    itemsPerPage: limitNum
                }
            },
            landlords: {
                data: landlordsResult.rows.map(removeCountColumn),
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalLandlords / limitNum),
                    totalItems: totalLandlords,
                    itemsPerPage: limitNum
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Additional controller for user statistics
export const getUserStatistics = async (req, res) => {
    try {
        const statisticsQuery = `
            SELECT 
                role, 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days
            FROM users
            GROUP BY role;
        `;

        const result = await pool.query(statisticsQuery);

        return res.status(200).json({
            statistics: result.rows
        });
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};



export const getAllHostels = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;
        const offset = (page-1) * limit;
      // Query to fetch hostels with aggregated details
      const query = `
        SELECT 
          h.id AS hostel_id,
          h.name AS hostel_name,
          CONCAT(u.firstname, ' ', u.lastname) AS landlord_name,
          h.location AS hostel_location,
          u.phone AS contact_number,
          hi.image_url AS image_url,
          COUNT(r.id) FILTER (WHERE r.status = 'available') AS available_rooms,
          COUNT(r.id) AS total_rooms,
          ARRAY_AGG(DISTINCT ha.amenity) AS amenities
        FROM 
          hostels h
        LEFT JOIN 
          users u ON h.manager_id = u.id
        LEFT JOIN 
          hostel_images hi ON h.id = hi.hostel_id
        LEFT JOIN 
          rooms r ON h.id = r.hostel_id
        LEFT JOIN 
          hostel_amenities ha ON h.id = ha.hostel_id
        GROUP BY 
          h.id, u.firstname, u.lastname, u.phone, hi.image_url
        ORDER BY 
          h.id
        LIMIT $1 OFFSET $2;
      `;
  
      // Execute the query
      const { rows } = await pool.query(query, [limit, offset]);
  
      // Transform the result into the desired format
      const hostels = rows.map((row) => ({
        id: row.hostel_id,
        name: row.hostel_name,
        landlordName: row.landlord_name,
        location: row.hostel_location,
        contactNumber: row.contact_number,
        imageUrl: row.image_url,
        availableRooms: parseInt(row.available_rooms, 10),
        totalRooms: parseInt(row.total_rooms, 10),
        amenities: row.amenities.filter(Boolean), // Remove null values
      }));

      const countQuery = `
      SELECT COUNT(DISTINCT h.id) AS total_hostels
      FROM hostels h
      `;
      const { rows: countRows } = await pool.query(countQuery);
      const totalHostels = parseInt(countRows[0].total_hostels, 10)
  
      // Send the response
      return res.status(200).json({
        success: true,
        data: hostels,
        pagination: {
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(totalHostels / limit),
            totalHostels,
            limit: parseInt(limit, 10)
        }
      });
    } catch (error) {
      console.error('Error fetching hostels:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };

  
  // Controller function to handle POST requests
export const submitContactForm = async (req, res) => {
      const { name, email, subject, message } = req.body;
      const user_id = req.user.userid;
    if(!user_id) {
        return res.status(404).json({ error: "Please you are not authenticated yet."})
    }
      // Validation
      if (!name || !email || !subject || !message) {
          return res.status(400).json({ error: 'All fields are required.' });
      }
  
      if (!validateEmail(email)) {
          return res.status(400).json({ error: 'Invalid email format.' });
      }
  
      try {
          // Insert data into the database
          const query = `
              INSERT INTO contact (user_id,name, email, subject, message)
              VALUES ($1, $2, $3, $4, $5)
              RETURNING id, created_at;
          `;
          const values = [user_id, name, email, subject, message];
  
          const result = await pool.query(query, values);
  
          // Respond with success message
          res.status(200).json({
              message: 'Message sent successfully!',
              details: {
                  id: result.rows[0].id,
                  createdAt: result.rows[0].created_at,
              },
          });
      } catch (error) {
          console.error('Database error:', error.message);
          res.status(500).json({ error: 'Failed to send message. Please try again later.' });
      }
  };
  
  // Helper function to validate email format
  const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  };


// Controller function to fetch all contact messages
export const getAllContactMessages = async (req, res) => {
    try {
        // Query to fetch all messages from the database
        const query = `
            SELECT id, user_id, name, email, subject, message, created_at
            FROM contact
            ORDER BY created_at DESC;
        `;

        const result = await pool.query(query);

        // Respond with the list of messages
        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).json({ error: 'Failed to fetch messages. Please try again later.' });
    }
};