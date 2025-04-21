import pool from "../connections/db.cjs";

export const createUser = async (id, firstName,lastName, email, phone, hashedPassword, userId, role) => {
    const query = `
    INSERT INTO users (id, firstName, lastName, email, phone, hashedPassword, userId, role)
    VALUES ($1, $2, $3,$4,$5,$6,$7,$8) RETURNING id, firstName,lastName email, phone, hashedPassword, role
    `;
    const values = [id, firstName, lastName,email, phone, hashedPassword, userId, role]
    const result = await pool.query(query, values);
    return result.rows[0]
}

export const getUserByEmail = async (email) => {
    const query = 'select * from users where email = $1';
    const result = await pool.query(query, [email])
    return result.rows[0]
}

export const getUserByUser_Id = async (userId) => {
    const query = 'select * from users where userId = $1';
    const result = await pool.query(query, [userId])
    return result.rows[0]
}
