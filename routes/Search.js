var express = require('express');
var router = express.Router();
const multer = require('multer')
const uploader = multer(
    {
        dest: 'public/uploads/',
        fileFilter: (req, file, callback) => {
            // add a filter to the mime type so only image files will be accepted
            if (file.mimetype.startsWith('image/')) {
                callback(null, true) // null means no error message, true means allowed
            } else {
                // make new error with message, and false means not allowed
                return callback(new Error('Only images are allowed'), false)
            }
        },
        limits: {
            fileSize: 2 * 1024 * 1024 // 2mB MAX FILE SIZE
        }
    })
const fs = require('fs')
// eslint-disable-next-line no-unused-vars

// include code from express validator package
const { body, query, validation, validationResult } = require('express-validator')
// Create a formatter to clean up the validation result data in a way that makes it easier to display to the user
const onlyMsgErrorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    return msg // we only want the message from All the params being sent in to the formatter
}


/* GET home page. */
router.get('/',  function(req, res, next) {
    res.render('Search_Form', { title: 'Search Form' });
});

/* POST handler for http://localhost:3000/ */
router.post('/search', async function(req, res, next) {

    let data = await fetchData(req.body.sMethod, req.body.search);

    res.render('Search_Result',
        {
            pageTitle: `Search results for ${req.body.search}`,
            data
        });
})

const fetchData =  (method, search) => {
    let string = search.replaceAll(" " , "+")
    return fetch(`https://openlibrary.org/search.json?${method}=${string}`)
        .then(res => {
            if (!res.ok) {
                throw new Error("Something went wrong");
            }
            return res.json();
        })
        .then(json => {
            return json.docs;
        })
}


router.get('/Review',  function(req, res, next) {
    res.render('Review', { title: 'Review Form' });
});
router.post('/Review',uploader.fields([{ name: 'Review_photo', maxCount: 1 }]),
    [
        body('name').trim().notEmpty().withMessage('You must enter a pen name').bail()
            .isLength({min: 3, max: 20}).withMessage('Pen name must be between 3 and 20 character long'),

        body('rating').notEmpty().custom( (value, {req}) =>{
            if (req.body.rating <1){
                throw new Error('Rating must be not be below 1')
            }
            return true
        }).bail()
        .custom((value,{req}) =>{
            if(req.body.rating > 5){
                throw new Error('Rating must not be above 5')
            }
            return true
        }),

        body('comment').trim().notEmpty().withMessage('You must enter a comment').bail()
            .isLength({min: 1, max: 255}).withMessage("A comment must be under 255 characters in length").bail(),
    ],
    (req, res) => {
        const violations = validationResult(req)
        console.log('Validation Results Violations')
        console.log(violations)

        // take the ugly violations onj and clean it up for display
        const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped()

        console.log(errorMessages)

        res.render("Review",{
            title: 'Review form',
            name: req.body.name,
            comment: req.body.comment,
            rating: req.body.rating,
            err: errorMessages
        })
    })




module.exports = router;