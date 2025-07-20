const express = require("express");
const router = express.Router();
const { validateBody } = require("../middleware/validators");
const newsController = require("../controllers/news");

router.get("/gamenews", validateBody, newsController.getGameNews);

module.exports = router;
