const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendNotification = require("../utils/sendNotification");
const path = require("path");
const Item = require('../Models/Item');
const Vendor = require('../Models/Vendor');

// Register a user
exports.registerUser = async (req, res) => {
  const { username, email, password, phone } = req.body;
  let userType = "Editor";

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const allUsers = await User.find();
    if (allUsers.length === 0) {
      userType = "Admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, phone, password: hashedPassword, userType });
    await newUser.save();

    // Notify all admins
    if (userType !== "Admin") {
      const admins = await User.find({ userType: "Admin" });
      for (const admin of admins) {
        await sendNotification({
          userId: admin._id,
          message: `🆕 New user registered: ${newUser.username}`,
          type: "user_registration",
          link: `/user/${newUser._id}`,
          data: {
            username: newUser.username,
            email: newUser.email,
            userType: newUser.userType,
            registeredAt: newUser.createdAt,
          },
        });
      }
    }

    return res.status(200).json({ msg: "✅ New User Created" });
  } catch (e) {
    console.error("❌ Registration error:", e);
    return res.status(500).json({ msg: "❌ Problem in creating user" });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, userType: user.userType, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      msg: "✅ Logged in successfully",
      token,
      userType: user.userType,
      username: user.username,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ msg: "Server error" });
  }
};

// GET own profile
exports.getOwnProfileData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.status(200).json({ user });
  } catch (e) {
    return res.status(500).json({ msg: "Error fetching profile", error: e.message });
  }
};

// UPDATE own profile with photo
exports.updateOwnProfileData = async (req, res) => {
  try {
    const { username, email } = req.body;

    const updates = {
      ...(username && { username }),
      ...(email && { email }),
    };

    if (req.file) {
      updates.profilePicUrl = path.join("uploads", req.file.filename);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    return res.status(200).json({ msg: "✅ Profile updated", user: updatedUser });
  } catch (e) {
    return res.status(500).json({ msg: "Error updating profile" });
  }
};

// DELETE own profile
exports.deleteOwnProfileData = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "❌ Password mismatch" });

    await User.findByIdAndDelete(req.user.id);
    return res.status(200).json({ msg: "✅ User deleted successfully" });
  } catch (e) {
    return res.status(500).json({ msg: "Error deleting profile", error: e.message });
  }
};

// Admin-only: GET user by ID
exports.getOneUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.status(200).json(user);
  } catch (e) {
    return res.status(404).json({ msg: "User not found" });
  }
};

// Admin-only: UPDATE user
exports.updateOneUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (e) {
    return res.status(500).json({ msg: "❌ Cannot update user" });
  }
};

// Admin-only: DELETE user
exports.deleteOneUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ msg: "✅ User deleted successfully" });
  } catch (e) {
    return res.status(500).json({ msg: "❌ Error deleting user" });
  }
};

// GET total customers
exports.getTotalCustomerCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ userType: "Customer" });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ msg: "Error counting customers", error: error.message });
  }
};

// GET total editors
exports.getTotalEditors = async (req, res) => {
  try {
    const count = await User.countDocuments({ userType: "Editor" });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ msg: "❌ Failed to count editors", error: error.message });
  }
};

// GET all editors with bill count
exports.getAllEditors = async (req, res) => {
  try {
    const editors = await User.aggregate([
      { $match: { userType: "Editor" } },
      {
        $lookup: {
          from: "bills",
          localField: "_id",
          foreignField: "createdBy",
          as: "bills",
        },
      },
      {
        $addFields: {
          billCount: { $size: "$bills" },
        },
      },
      {
        $project: {
          password: 0,
          bills: 0,
          __v: 0,
        },
      },
    ]);

    res.status(200).json(editors);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch editors",
      error: error.message,
    });
  }
};

exports.updateOwnProfileDataWithPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get current user data
    const oldUser = await User.findById(userId);
    const oldUsername = oldUser.username;

    // 2. Only Admins can update username and email phone
    const updates = {};
    if (req.user.userType === "Admin") {
      if (req.body.username) updates.username = req.body.username;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.phone) updates.phone = req.body.phone; // ✅ Allow Admin to update phone
    }

    // 3. Anyone can update profile photo
    if (req.file) {
      updates.profilePicUrl = `uploads/${req.file.filename}`;
    }

    // If nothing to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ msg: "No valid fields to update" });
    }

    // 4. Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    // 5. If Admin changed username, propagate to dependent collections
    if (req.user.userType === "Admin" && req.body.username && req.body.username !== oldUsername) {
      const newUsername = req.body.username;

      await Item.updateMany({ createdBy: oldUsername }, { $set: { createdBy: newUsername } });
      await Vendor.updateMany({ createdBy: oldUsername }, { $set: { createdBy: newUsername } });
      // add more if needed (Bill, Exchange, etc.)
      console.log(`✅ Propagated createdBy change: '${oldUsername}' → '${newUsername}'`);
    }

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ msg: "Error updating profile" });
  }
};

