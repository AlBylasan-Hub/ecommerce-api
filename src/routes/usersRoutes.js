const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUserStatus
} = require("../controllers/usersController");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id/status", updateUserStatus);

module.exports = router;
