import express from 'express'
// const express = require("express");
const router = express.Router();
// const { registerUser } = require("../controllers/auth");
import { registerUser, loginUser, authenticationWithSSO } from '../controllers/auth.js'

// const { authenticateUser, authorizeRoles } = require("../middleware/authentication");

// router.post("/register", authenticateUser, authorizeRoles('superadmin','admin'), registerUser);
router.post("/admin",registerUser);
router.post("/login", loginUser);
router.post("/google-auth", authenticationWithSSO);


// module.exports = router;
export default router;