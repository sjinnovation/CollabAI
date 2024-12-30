import express from "express";
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js"; // Use `import` instead of `require`
import authenticateUser from "../middlewares/login.js";
const router = express.Router();

router.get("/",authenticateUser, getAllClients); // Route to get all clients
router.get("/:id",authenticateUser, getClientById); // Route to get a client by ID
router.post("/",authenticateUser, createClient); // Route to create a new client
router.put("/:id",authenticateUser, updateClient); // Route to update a client by ID
router.delete("/:id",authenticateUser, deleteClient); // Route to delete a client by ID

export default router;
