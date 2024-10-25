const express = require('express');
const router = express.Router();

/* GET request for http://localhost:3000/activity */
router.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
    }

    res.render('activity', {
        user: req.user,
        activity: req.session.activity
    })
})

module.exports = router;