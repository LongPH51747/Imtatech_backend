// routes/api.router.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const plantController = require('./planta_api.contronller');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// URL chỉ là '/identify'
router.post('/identify', upload.single('plantImage'), plantController.handleIdentifyPlant);

module.exports = router;