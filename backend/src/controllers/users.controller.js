import { PrismaClient } from "@prisma/client";
import { clerkClient } from "@clerk/express";

const prisma = new PrismaClient();

/**
 * GET /api/users
 * Returns all users in the system
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role) {
      where.role = role.toUpperCase();
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        promotedBy: true,
        promotedAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * POST /api/users/:userId/promote
 * Promote a customer to admin
 */
const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const performedBy = req.userId; // From auth middleware

    // Find user to promote
    const userToPromote = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToPromote) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToPromote.role === "ADMIN") {
      return res.status(400).json({ error: "User is already an admin" });
    }

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "ADMIN",
        promotedBy: performedBy,
        promotedAt: new Date(),
      },
    });

    // Update Clerk metadata
    try {
      await clerkClient.users.updateUserMetadata(userToPromote.clerkId, {
        publicMetadata: {
          role: "ADMIN",
        },
      });
    } catch (clerkError) {
      console.error("Clerk metadata update error:", clerkError);
      // Continue even if Clerk update fails - database is source of truth
    }

    res.json({
      message: "User promoted to admin successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        promotedAt: updatedUser.promotedAt,
      },
    });
  } catch (error) {
    console.error("Promote user error:", error);
    res.status(500).json({ error: "Failed to promote user" });
  }
};

/**
 * POST /api/users/:userId/demote
 * Demote an admin to customer (with safeguards)
 */
const demoteToCustomer = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user to demote
    const userToDemote = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDemote) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToDemote.role !== "ADMIN") {
      return res.status(400).json({ error: "User is not an admin" });
    }

    // Check if this is the last admin
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount <= 1) {
      return res.status(400).json({
        error: "Cannot demote the last admin. Promote another user first.",
      });
    }

    // Prevent self-demotion
    if (userToDemote.clerkId === req.userId) {
      return res.status(400).json({
        error: "You cannot demote yourself",
      });
    }

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "CUSTOMER",
        promotedBy: null,
        promotedAt: null,
      },
    });

    // Update Clerk metadata
    try {
      await clerkClient.users.updateUserMetadata(userToDemote.clerkId, {
        publicMetadata: {
          role: "CUSTOMER",
        },
      });
    } catch (clerkError) {
      console.error("Clerk metadata update error:", clerkError);
    }

    res.json({
      message: "User demoted to customer successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Demote user error:", error);
    res.status(500).json({ error: "Failed to demote user" });
  }
};

/**
 * GET /api/users/stats
 * Returns user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const customerCount = await prisma.user.count({
      where: { role: "CUSTOMER" },
    });

    // Recent sign-ups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSignUps = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    res.json({
      totalUsers,
      adminCount,
      customerCount,
      recentSignUps,
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
};

/**
 * POST /api/users/sync-clerk
 * Sync a user from Clerk to database (called after sign-up)
 */
const syncClerkUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: "clerkId and email are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) {
      return res.json({ message: "User already exists", user: existingUser });
    }

    // Create new user with CUSTOMER role by default
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: "CUSTOMER", // Default role
      },
    });

    res.status(201).json({
      message: "User synced successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Sync Clerk user error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
};

export {
  getAllUsers,
  promoteToAdmin,
  demoteToCustomer,
  getUserStats,
  syncClerkUser,
};
