import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_in_production";

export const authenticateCustomer = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "customer") {
      return res.status(403).json({ message: "Not authorized as customer" });
    }
    req.customer = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
