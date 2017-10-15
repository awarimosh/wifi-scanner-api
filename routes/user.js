var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');

router.post('/', userController.login);
router.get('/login', userController.login);
router.post('/register', userController.register);

module.exports = router;