import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const { verify } = jwt;

/**
 * Middleware to verify JWT token and extract user info
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ error: "Token expired - Please login again" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

/**
 * Middleware to ensure user has admin role
 * Must be used after requireAuth
 */
const requireAdmin = async (req, res, next) => {
  try {
    // Double-check role from database (in case it changed after token was issued)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Forbidden - Admin access required",
        userRole: user.role,
      });
    }

    // Update role in request in case it changed
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error("RBAC Error:", error);
    res.status(500).json({ error: "Failed to verify admin access" });
  }
};

/**
 * Combined middleware: Auth + Admin check
 */
const adminOnly = [requireAuth, requireAdmin];

export { requireAuth, requireAdmin, adminOnly };
