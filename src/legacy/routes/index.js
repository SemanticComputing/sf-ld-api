var express = require('express'),
    router = express.Router();

router.use('/oikeus', require('./ecli'));
router.use('/eli', require('./eli'));
router.use('/', require('./misc'));

module.exports = router;
