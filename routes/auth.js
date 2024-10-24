const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    scope: [ 'profile' ]
}, function verify(issuer, profile, cb) {
    const user = {
        googleId: profile.id,
        email: profile.email,
        displayName: profile.displayName
    }
    cb(null, user);
}));

passport.serializeUser(function(user, done) {
    done(null, user); // Serialize based on Google ID
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/search',
    failureRedirect: '/login'
}));

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;