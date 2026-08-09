const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client.controller");

// Client Application Routes
router.post("/clients", clientController.createClient);
router.get("/clients", clientController.getAllClients);
router.post("/get-client", clientController.getAClients);
router.post("/admin/search", clientController.searchClientsAdmin);
router.put("/clients/:id", clientController.editClient);
router.delete("/clients/:id", clientController.deleteClient);

module.exports = router;