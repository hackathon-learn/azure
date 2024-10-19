//js
const express = require('express');
const { CreateCloud  } = require('../controllers/createcloudresource');
const router = express.Router();

router.post('/createcloudresource', CreateCloud);
module.exports = router;