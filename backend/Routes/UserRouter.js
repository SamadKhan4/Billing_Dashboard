const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  registerUser,
  loginUser,
  getOwnProfileData,
  updateOwnProfileData,
  updateOwnProfileDataWithPhoto, // ✅ new controller
  deleteOwnProfileData,
  getOneUser,
  deleteOneUser,
  updateOneUser,
  getTotalCustomerCount,
  getTotalEditors,
  getAllEditors,
} = require("../Controllers/UserController");

const {
  isLoggedIn,
  isAdmin,
  isEditorOrAdmin,
} = require("../Middlewares/AuthMiddleware");

// ✅ Multer setup for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

// ✅ PUBLIC ROUTES
router.post("/login", loginUser);
router.post("/register", registerUser);

// ✅ AUTHENTICATED USER ROUTES
router.get("/myprofile", isLoggedIn, getOwnProfileData);
router.patch("/myprofile", isLoggedIn, updateOwnProfileData); // Legacy patch
router.put("/updateprofile", isLoggedIn, upload.single("photo"), updateOwnProfileDataWithPhoto); // ✅ New route
router.delete("/myprofile", isLoggedIn, deleteOwnProfileData);

// ✅ ADMIN-ONLY ROUTES
router.post("/create-editor", isLoggedIn, isAdmin, registerUser);
router.get("/customers-count", isLoggedIn, isAdmin, getTotalCustomerCount);
router.get("/editors-count", isLoggedIn, isAdmin, getTotalEditors);
router.get("/editors", isLoggedIn, isAdmin, getAllEditors);
router.get("/:id", isLoggedIn, isAdmin, getOneUser);
router.patch("/:id", isLoggedIn, isAdmin, updateOneUser);
router.delete("/:id", isLoggedIn, isAdmin, deleteOneUser);

module.exports = router;
