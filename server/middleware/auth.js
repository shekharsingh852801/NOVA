import jwt from "jsonwebtoken";

export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id, role }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

export function authorizeRole(roles = []) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Forbidden: You don't have enough permissions" });
    }
    next();
  };
}
