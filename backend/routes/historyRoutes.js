const express = require("express");
const router = express.Router();
const { addToHistory, getUserHistory } = require("../controllers/historyController"); 

router.post("/", addToHistory); 

router.get("/:userId", getUserHistory); 

module.exports = router;
