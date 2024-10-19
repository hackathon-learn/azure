//js
const express = require('express');
const { DashBoardView  } = require('../controllers/dashboard');
const router = express.Router();
router.get('/dashboard', DashBoardView);
module.exports = router;