//js
const express = require('express');
const {loginView , login } = require('../controllers/login');
const router = express.Router();
router.get('/login', loginView);
router.get('/', loginView);
router.post('/login', login);
module.exports = router;