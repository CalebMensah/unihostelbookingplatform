import { v4 as uuidv4 } from "uuid"
import { createUser, getUserByEmail, getUserByUser_Id } from "../models/userModels.js"
import bcrypt from 'bcryptjs'
import { validationResult } from "express-validator"
import jwt from 'jsonwebtoken'
import { requestVerificationEmail } from "./emailVerificationsController.js"
import pool from "../connections/db.cjs"
import { generateResetToken } from "../utils/generateResetToken.js"
import { sendResetEmail } from "./emailVerificationsController.js"


// generate custom userId
const generateUserId = (firstName,lastName) => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}${randomDigits}`
}

// register user
export const registerUser = async (req,res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) return res.status(400).json({ error: error.array() })
    const {firstName, lastName, email, phone, password, role = 'student'} = req.body

    try {
        const existingUser = await getUserByEmail(email.trim());
        if(existingUser) return res.status(400).json({message: "Email already exist"});

        const hashedPassword = await bcrypt.hash(password, 10)
        const id = uuidv4()
        const userId = generateUserId(firstName,lastName);

        const newUser = await createUser(id,firstName, lastName,email,phone,hashedPassword,userId, role)

        // Generate a token for the new user to use requestVerificationEmail
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "24h" });

        // Use requestVerificationEmail with the token in headers
        const verificationReq = {
            headers: { authorization: `Bearer ${token}` }
        };
        const verificationRes = {
            json: (data) => console.log('Verification email response:', data),
            status: (code) => ({ json: (data) => console.log('Verification error:', code, data) })
        };
        
        await requestVerificationEmail(verificationReq, verificationRes);

        res.status(201).json({
            message: "Account created successfully. Please check your email to verify your account.",
            user: newUser
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({message: "Server error during registration"});
    }
}

// login user
export const loginUser = async(req,res) => {
    const {specialId, password } = req.body;
    console.log("user id", specialId)
    console.log('password:', password)
    console.log(req.body)

    try {
        const user = await getUserByUser_Id(specialId)
        console.log("user from db:", user)
        if (!user) return res.status(400).json({message: "Invalid credentials"});

        const isMatch = await bcrypt.compare(password, user.hashedpassword);
        if(!isMatch) return res.status(400).json({ message: "Invalid credentials "});

        const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {
            expiresIn: "24h"
        });

        res.json({token, user: {id: user.id, firstName:user.firstname, lastname: user.lastname, email: user.email, phone: user.phone, role: user.role, userid:user.userid}})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error"})
    }
}

// password reset
export const resetPassword = async(req,res) => {
    const { token } = req.params;
    const {newPassword} = req.body;

    if(newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
        return res.status(400).json({ message: "weak password"})
    };

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, decoded.email]);

        res.json({ message: "password reset successful"})
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token"})
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const resetToken = generateResetToken(); // Function to create a reset token
    await sendResetEmail(user.email, resetToken); // Function to send email with reset link

    res.json({ message: "Reset link sent successfully!" });
};



export const getAllStudentsInAHostel = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Count total students
        const countQuery = `
            SELECT COUNT(*) as total
            FROM users u 
            JOIN bookings b ON u.userid = b.user_id 
            JOIN rooms r ON b.room_id = r.id 
            JOIN hostels h ON b.hostel_id = h.id;
        `;
        const countResult = await pool.query(countQuery);
        const totalStudents = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalStudents / limit);

        // Fetch paginated students
        const studentsQuery = `
            SELECT  
            u.firstname,  
            u.lastname, 
            u.phone, 
            u.userid, 
            b.booking_id, 
            r.room_number  
            FROM users u 
            JOIN bookings b ON u.userid = b.user_id 
            JOIN rooms r ON b.room_id = r.id 
            JOIN hostels h ON b.hostel_id = h.id 
            LIMIT $1 OFFSET $2;
        `;
        const studentsResult = await pool.query(studentsQuery, [limit, offset]);

        // Return paginated data
        return res.status(200).json({
            students: studentsResult.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalStudents,
                pageSize: limit
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getStudentProfileInformation = async (req,res) => {
    const studentId = req.user.userid;
    console.log("user id:", studentId);

    try {
        const result = await pool.query(
          `
          SELECT
            u.userid as userid,
            u.firstname,
            u.lastname,
            u.email,
            u.phone,
            h.name,
            r.room_number,
            b.start_date,
            b.end_date
          FROM users u
          LEFT JOIN bookings b ON u.userid = b.user_id
          LEFT JOIN rooms r ON b.room_id = r.id
          LEFT JOIN hostels h ON r.hostel_id = h.id
          WHERE u.userid = $1
          `,
          [studentId]
        );
    
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Student profile not found.' });
        }
    
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error in getStudentProfileInformation:', error);
        res.status(500).json({
          message: 'Error fetching student profile information',
          error: error.message,
        });
      }
}

export const updateStudentProfile = async(res, req) => {
    const { firstname, lastname, email, phone } = req.body;
    const studentId = req.user.userid;
  
    try {
      let query = 'UPDATE users SET ';
      const params = [];
      let paramIndex = 1;
  
      if (firstname !== undefined) {
        query += `firstname = $${paramIndex}, `;
        params.push(firstname);
        paramIndex++;
      }
      if (lastname !== undefined) {
        query += `lastname = $${paramIndex}, `;
        params.push(lastname);
        paramIndex++;
      }
      if (email !== undefined) {
        query += `email = $${paramIndex}, `;
        params.push(email);
        paramIndex++;
      }
      if (phone !== undefined) {
        query += `phone = $${paramIndex}, `;
        params.push(phone);
        paramIndex++;
      }
  
      // Remove trailing comma and space
      query = query.slice(0, -2);
  
      query += ` WHERE userid = $${paramIndex}`;
      params.push(studentId);
  
      await pool.query(query, params);
  
      res.json({ message: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        message: 'Error updating profile',
        error: error.message,
      });
    }
}

export const getLandlordProfile = async (req, res) => {
  const userId = req.user.userid; // Assuming user ID is extracted from JWT token

  try {
    // Fetch basic user details
    const userQuery = `
      SELECT userid, firstname AS name, email, phone, address 
      FROM users 
      WHERE userid = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult.rows[0];

    // Fetch hostels owned by the landlord
    const hostelsQuery = `
      SELECT id, name, location AS address, description, is_hostel_verified 
      FROM hostels 
      WHERE owner_id = $1
    `;
    const hostelsResult = await pool.query(hostelsQuery, [userId]);

    const hostels = hostelsResult.rows;

    // Fetch rooms for each hostel
    const properties = await Promise.all(
      hostels.map(async (hostel) => {
        const roomsQuery = `
          SELECT room_number, price, capacity, status 
          FROM rooms 
          WHERE hostel_id = $1
        `;
        const roomsResult = await pool.query(roomsQuery, [hostel.id]);
        const rooms = roomsResult.rows;

        const totalRooms = rooms.length;
        const availableRooms = rooms.filter((room) => room.status === 'available').length;

        // Fetch amenities for the hostel
        const amenitiesQuery = `
          SELECT amenity_name 
          FROM hostel_amenities 
          WHERE hostel_id = $1
        `;
        const amenitiesResult = await pool.query(amenitiesQuery, [hostel.id]);
        const amenities = amenitiesResult.rows.map((row) => row.amenity_name);

        return {
          id: hostel.id,
          name: hostel.name,
          address: hostel.location,
          type: "Hostel",
          totalRooms,
          availableRooms,
          pricePerMonth: rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length) : 0,
          distanceFromCampus: "0.5 miles", // Placeholder, replace with actual logic
          amenities,
        };
      })
    );

    const totalProperties = properties.length;
    const totalRooms = properties.reduce((sum, property) => sum + property.totalRooms, 0);

    const profile = {
      userId: user.userid,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      businessName: "Private Landlord", // Replace with actual business name if applicable
      registrationNumber: "BUS12345678", // Replace with actual registration number if applicable
      accountCreated: new Date().toISOString(), // Replace with actual creation date
      totalProperties,
      totalRooms,
      properties,
    };

    res.json(profile);
  } catch (error) {
    console.error("Error fetching landlord profile:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateLandlordProfile = async (req, res) => {
  const userId = req.user.userid;
  const {  email, phone, address } = req.body;

  try {
    const query = `
      UPDATE users 
      SET email = $1, phone = $2, address = $3 
      WHERE userid = $4
    `;
    await pool.query(query, [email, phone, address, userId]);

    res.json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating landlord profile:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};