//js
const express = require('express');
const {HomeView } = require('../controllers/home');
const router = express.Router();
router.get('/', HomeView);
module.exports = router;