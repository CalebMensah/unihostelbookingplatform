import jwt from 'jsonwebtoken';
import pool from '../connections/db.cjs'; 
export const verifyToken = async (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token) return res.status(401).json({ message: "Unauthorized"});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await pool.query("select * from users where id = $1", [decoded.id]);

        if(!user.rows.length) return res.status(401).json({ message: "User not found"});
        if(!user.rows[0].is_verified) return res.status(403).json({ message: "Email not verified"});

        req.user = user.rows[0]
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" })
    }
}