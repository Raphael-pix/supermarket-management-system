import { getAuth } from "@clerk/express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Middleware to ensure user is authenticated
 */
const requireAuth = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({ error: "Unauthorized - Please sign in" });
  }

  req.userId = auth.userId;
  next();
};

/**
 * Middleware to ensure user has admin role
 * Must be used after requireAuth
 */
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
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

    req.userRole = user.role;
    req.userEmail = user.email;
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
