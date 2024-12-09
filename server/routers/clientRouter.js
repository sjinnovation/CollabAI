import express from "express";
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js"; // Use `import` instead of `require`

const router = express.Router();

router.get("/", getAllClients); // Route to get all clients
router.get("/:id", getClientById); // Route to get a client by ID
router.post("/", createClient); // Route to create a new client
router.put("/:id", updateClient); // Route to update a client by ID
router.delete("/:id", deleteClient); // Route to delete a client by ID

export default router;
