var express = require('express'),
    router = express.Router();

router.use('/ecli', require('./ecli'));
router.use('/eli', require('./eli'));
router.use('/', require('./misc'));

module.exports = router;
