//js
const express = require('express');
const { depview } = require('../controllers/deployments');
const router = express.Router();
router.get('/deployments', depview);
module.exports = router;