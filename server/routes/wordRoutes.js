const express = require("express");
const router = express.Router();
const controller = require("../controllers/wordController");

router.get("/", controller.getAll);
router.get("/search", controller.search);
router.get("/:id", controller.getById);
router.post("/", controller.addWord);
router.put("/:id", controller.updateWord);
router.delete("/:id", controller.deleteWord);
router.post("/check", controller.checkWord);

module.exports = router;
