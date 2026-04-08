import jwt from "jsonwebtoken";
import db from "../config/db.js";

// ─── Regular User Auth ────────────────────────────────────────────────────────
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db("users")
      .where({ id: decoded.id })
      .first(["id", "name", "email", "role"]);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// ─── Admin Auth (admin or super_admin) ───────────────────────────────────────
export const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await db("users")
      .where({ id: decoded.id })
      .first(["id", "name", "email", "role"]);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized: Admin not found" });
    }

    if (!["admin", "super_admin"].includes(admin.role)) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// ─── Super Admin Auth ─────────────────────────────────────────────────────────
export const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await db("users")
      .where({ id: decoded.id })
      .first(["id", "name", "email", "role"]);

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized: Admin not found" });
    }

    if (admin.role !== "super_admin") {
      return res.status(403).json({ message: "Forbidden: Super admin access required" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Super admin auth error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};