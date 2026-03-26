import {
  checkOtpRestrictions,
  trackOtpRequests,
  sendOtpByEmail,
  sendOtpByForget,
} from "../utils/authHelper.js";
import db from "../config/db.js";
import { getRedis } from "../config/redis.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../libs/cloudinary.js";

const redis = getRedis();

const ensureRedisConnection = async () => {
  if (!redis.status || redis.status === "end") {
    await redis.connect();
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const restriction = await checkOtpRestrictions(email);
    if (!restriction.success) {
      return res.status(restriction.status).json({ message: restriction.message });
    }

    const tracking = await trackOtpRequests(email);
    if (!tracking.success) {
      return res.status(tracking.status).json({ message: tracking.message });
    }

    const otpResult = await sendOtpByEmail(name, email);
    if (!otpResult.success) {
      return res.status(otpResult.status).json({ message: otpResult.message });
    }

    res.status(200).json({ message: "OTP sent successfully to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendSignupOtp = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const restriction = await checkOtpRestrictions(email);
    if (!restriction.success) {
      return res.status(restriction.status).json({ message: restriction.message });
    }

    const tracking = await trackOtpRequests(email);
    if (!tracking.success) {
      return res.status(tracking.status).json({ message: tracking.message });
    }

    const otpResult = await sendOtpByEmail(name || "User", email);
    if (!otpResult.success) {
      return res.status(otpResult.status).json({ message: otpResult.message });
    }

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signupVerifyOtp = async (req, res) => {
  try {

    const { name, email, password, otp,role } = req.body;
   
    

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    await ensureRedisConnection();
    const savedOtp = await redis.get(`otp:${email}`);

    if (!savedOtp) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (savedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }
console.log(imageUrl);

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userId] = await db("users").insert({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      role:role
    });

    const user = await db("users")
      .where({ id: userId })
      .first(["id", "name", "email", "image"]);

    
    await redis.del(`otp:${email}`);

    const token=generateTokenAndSetCookie(res, { id: user.id, email: user.email,role:user.role });

    res.status(201).json({
      message: "Signup successful",
      user,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db("users").where({ email }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

const token=generateTokenAndSetCookie(res, { id: user.id, email: user.email,role:user.role });
    const { password: _, ...safeUser } = user;

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db("users").where({ email }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    const restriction = await checkOtpRestrictions(email);
    if (!restriction.success) {
      return res.status(restriction.status).json({ message: restriction.message });
    }

    const tracking = await trackOtpRequests(email);
    if (!tracking.success) {
      return res.status(tracking.status).json({ message: tracking.message });
    }

    const otpResult = await sendOtpByForget(user.name, email);
    if (!otpResult.success) {
      return res.status(otpResult.status).json({ message: otpResult.message });
    }

    res.status(200).json({ message: "OTP sent for password reset" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db("users").where({ email }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    const restriction = await checkOtpRestrictions(email);
    if (!restriction.success) {
      return res.status(restriction.status).json({ message: restriction.message });
    }

    const tracking = await trackOtpRequests(email);
    if (!tracking.success) {
      return res.status(tracking.status).json({ message: tracking.message });
    }

    const otpResult = await sendOtpByEmail(user.name, email);
    if (!otpResult.success) {
      return res.status(otpResult.status).json({ message: otpResult.message });
    }

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await ensureRedisConnection();
    const savedOtp = await redis.get(`otp:${email}`);

    if (!savedOtp || savedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await redis.setex(`reset_verified:${email}`, 300, "true");

    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    await ensureRedisConnection();
    const isVerified = await redis.get(`reset_verified:${email}`);

    if (!isVerified) {
      return res.status(403).json({ message: "OTP verification required" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db("users").where({ email }).update({ password: hashedPassword });

    await redis.del(`otp:${email}`);
    await redis.del(`reset_verified:${email}`);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const user = await db("users").where({ id: userId }).first();
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) {
      await db("users").where({ id: userId }).update({ name });
    }

    if (req.file) {
      if (user.img) {
        await deleteFromCloudinary(user.img);
      }

      const imageUrl = await uploadToCloudinary(req.file.buffer);

      await db("users").where({ id: userId }).update({ img: imageUrl });
    }

    const updatedUser = await db("users")
      .select("id", "name", "email", "img","role")
      .where({ id: userId })
      .first();

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

    

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    await ensureRedisConnection();

    const cacheKey = `user:${userId}`;

   
    const cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      return res.status(200).json({
        message: "User profile fetched (cache)",
        user: JSON.parse(cachedUser),
      });
    }

    
    const user = await db("users")
      .select("id", "name", "email", "image", "role")
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await redis.setex(cacheKey, 240, JSON.stringify(user));

    res.status(200).json({
      message: "User profile fetched (db)",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};