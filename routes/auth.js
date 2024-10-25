const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();

//Configuring the GoogleStrategy with passport
passport.use(new GoogleStrategy({
    // Client ID and secret registered with google
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/oauth2/redirect/google',
    scope: [ 'profile', 'email' ]
}, function verify(issuer, profile, cb) {
    // Creating our user object to store in the req.user
    const user = {
        email: profile.emails[0].value,
        displayName: profile.displayName
    }
    cb(null, user);
}));

passport.serializeUser(function(user, done) {
    // Serializing the user to work with sessions
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // Deserializing the user to work with data
    done(null, user);
});

// Sending users to google to sign in
router.get('/login/federated/google', passport.authenticate('google'));

// What happened after we sent them to google?
router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/search',
    failureRedirect: '/login'
}));

// Giving users the ability to log out
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

// Simple login page with a button to sign in with google
router.get('/login', (req, res) => {
    res.render('login');
});

module.exports = router;