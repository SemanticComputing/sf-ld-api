var express = require('express'),
    router = express.Router(),
    judgmentController = require('../controllers/api/judgment-controller'),
    statuteController = require('../controllers/api/statute-controller');

router.get('/judgments', judgmentController.find);
router.get('/judgments/:ecli', judgmentController.findOne);
router.get('/judgements', judgmentController.find);
router.get('/judgements/:ecli', judgmentController.findOne);
router.get('/statutes', statuteController.find);
router.get('/statutes/:year', statuteController.find);
router.get('/statutes/:year/:id*', statuteController.findOne);


module.exports = router;
