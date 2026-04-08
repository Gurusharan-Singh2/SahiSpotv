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
