export const allowRoles = (roles) => (req, res, next) => {
    console.log('Checking role:', req.user?.role, 'Against allowed roles:', roles);
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};