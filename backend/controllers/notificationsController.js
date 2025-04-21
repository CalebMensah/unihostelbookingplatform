// controllers/notificationController.js

import pool from '../connections/db.cjs';


export const getNotifications = async (req, res) => {
  const landlord_id = req.user.id;

  if (!landlord_id) {
    return res.status(400).json({ message: "Landlord ID is required." });
  }

  const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 notifications
  const offset = parseInt(req.query.offset, 10) || 0; // Default to 0 (start from the first notification)

  try {
    const query = `
      SELECT 
      id AS notificationId,
        type,
        title,
        message,
        student_name AS studentName,
        student_id AS studentId,
        hostel_name AS hostelName,
        room_number AS roomNumber,
        is_read AS isRead,
        booking_id AS bookingId,
        created_at AS createdAt
      FROM notifications
      WHERE landlord_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [landlord_id, limit, offset]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No notifications found." });
    }

    res.json({
      notifications: result.rows,
      pagination: {
        limit,
        offset,
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [notificationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found or unauthorized." });
    }

    res.json({ message: "Notification marked as read.", notification: result.rows[0] });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.userid;

  try {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [notificationId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found or unauthorized." });
    }

    res.json({ message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

