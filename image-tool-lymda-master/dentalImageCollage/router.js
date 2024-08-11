const express = require('express');
const router = express.Router()

router.use('/api/form', require('./form'))
module.exports = router