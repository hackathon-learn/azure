//js
const express = require('express');
const { VarFileCont  } = require('../controllers/launchsolution');
const router = express.Router();

router.post('/launchsolution', VarFileCont);
module.exports = router;