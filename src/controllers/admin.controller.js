import db from "../config/db.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

// ─── Admin Login ──────────────────────────────────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await db("users")
      .where({ email })
      .whereIn("role", ["admin", "super_admin"])
      .first(["id", "name", "email", "password", "role"]);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateTokenAndSetCookie(res, {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Admin Logout ─────────────────────────────────────────────────────────────
export const adminLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Admin logged out successfully" });
};

// ─── Get All Users (non-admin) ────────────────────────────────────────────────
export const getAllUser = async (req, res) => {
  try {
    const allUser = await db("users")
      .whereIn("role", ["user", "owner"])
      .select("id", "name", "email", "role", "created_at")
      .orderBy("created_at", "desc");

    res.status(200).json({ success: true, allUser });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get Pending Parking Locations ────────────────────────────────────────────
export const getPendingParkingLocations = async (req, res) => {
  try {
    const pendingLocations = await db("parking_locations as pl")
      .leftJoin("users as u", "u.id", "pl.owner_id")
      .select(
        "pl.id",
        "pl.name",
        "pl.description",
        "pl.address",
        "pl.city",
        "pl.state",
        "pl.latitude",
        "pl.longitude",
        "pl.status",
        "pl.created_at",
        "pl.owner_id",
        "u.name as owner_name",
        "u.email as owner_email"
      )
      .where("pl.status", "pending")
      .orderBy("pl.created_at", "desc");

    res.status(200).json({ success: true, parkingLocations: pendingLocations });
  } catch (error) {
    console.error("Get pending parking locations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Approve Parking ──────────────────────────────────────────────────────────
export const approveParking = async (req, res) => {
  try {
    const { locationId } = req.params;

    const updated = await db("parking_locations")
      .where({ id: locationId })
      .update({
        status: "approved",
        approved_by: req.admin.id,
        approved_at: db.fn.now(),
      });

    if (!updated) {
      return res.status(404).json({ message: "Parking location not found" });
    }

    res.status(200).json({ success: true, message: "Parking approved successfully" });
  } catch (error) {
    console.error("Approve parking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Reject Parking ───────────────────────────────────────────────────────────
export const rejectParking = async (req, res) => {
  try {
    const { locationId } = req.params;

    const updated = await db("parking_locations")
      .where({ id: locationId })
      .update({ status: "rejected" });

    if (!updated) {
      return res.status(404).json({ message: "Parking location not found" });
    }

    res.status(200).json({ success: true, message: "Parking rejected successfully" });
  } catch (error) {
    console.error("Reject parking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get All Bookings (Admin) ────────────────────────────────────────────────
export const getAllBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const bookings = await db("bookings as b")
      .leftJoin("users as u", "u.id", "b.user_id")
      .leftJoin("parking_locations as pl", "pl.id", "b.parking_location_id")
      .select(
        "b.id", "b.start_time", "b.end_time", "b.total_amount", "b.platform_fee",
        "b.owner_earnings", "b.status", "b.payment_status", "b.created_at",
        "u.name as user_name", "u.email as user_email",
        "pl.name as parking_name"
      )
      .orderBy("b.created_at", "desc")
      .limit(limit).offset(offset);

    const [{ total }] = await db("bookings").count("id as total");

    res.status(200).json({ success: true, bookings, total, page, limit });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Get All Parking Locations (Admin) ───────────────────────────────────────
export const getAllParkingLocations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let query = db("parking_locations as pl")
      .leftJoin("users as u", "u.id", "pl.owner_id")
      .select(
        "pl.id", "pl.name", "pl.address", "pl.city", "pl.status", "pl.created_at",
        "u.name as owner_name", "u.email as owner_email"
      )
      .orderBy("pl.created_at", "desc");

    if (req.query.status) {
      query = query.where("pl.status", req.query.status);
    }

    const locations = await query.limit(limit).offset(offset);

    let countQuery = db("parking_locations");
    if (req.query.status) countQuery = countQuery.where("status", req.query.status);
    const [{ total }] = await countQuery.count("id as total");

    res.status(200).json({ success: true, parkingLocations: locations, total, page, limit });
  } catch (error) {
    console.error("Get all parking locations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Suspend User (Admin) ─────────────────────────────────────────────────────
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await db("users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Rather than delete, we change role to "suspended" (or implement a status flag if it exists).
    // Let's use role "suspended" or if there's no status column, modifying role breaks their login.
    await db("users").where({ id: userId }).update({ role: "suspended" });

    res.status(200).json({ success: true, message: "User suspended successfully" });
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Suspend Parking Location (Admin) ─────────────────────────────────────────
export const suspendParkingLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const updated = await db("parking_locations")
      .where({ id: locationId })
      .update({ status: "suspended" });

    if (!updated) {
      return res.status(404).json({ message: "Parking location not found" });
    }

    res.status(200).json({ success: true, message: "Parking location suspended successfully" });
  } catch (error) {
    console.error("Suspend parking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
