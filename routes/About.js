var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
    }
    res.render('About',{
        user: req.user
    })
});

module.exports = router;