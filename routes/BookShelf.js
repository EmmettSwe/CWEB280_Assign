const onlyMsgErrorFormatter = ({location, msg, param, value, nestedErrors}) => {
    return msg // we only want the message from All the params being sent in to the formatter
}
const fs = require('fs')
const {body, query, validation, validationResult} = require('express-validator')
const multer = require("multer");
var express = require('express');
var router = express.Router();

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
            fileSize: 2 * 1024 * 1024
        }
    })


class Book {
    constructor(title, author_name, cover_i, first_published_year) {
        this.title = title;
        this.author_name = author_name;
        this.cover_i = cover_i;
        this.first_published_year = first_published_year;
    }
}

class Review {
    constructor(rating, name, review, book, img) {
        this.rating = rating;
        this.name = name;
        this.rating = rating;
        this.review = review;
        this.book = book;
        this.img = img;
    }

}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('Bookshelf', {
        title: 'Your Bookshelf',
        reviews: reviews
    });
});
let books = []
let reviews = []
let currBook
router.get('/Review', function (req, res, next) {
    currBook = new Book(
        req.query.title,
        req.query.author_name,
        `https://covers.openlibrary.org/b/id/${req.query.image}-M.jpg`,
        req.query.first_published_year)
    books.push(currBook)

    res.render('Review', {
        title: req.query.title
    });
});
let a =false
let b=false
let c=false
router.post('/Review', uploader.fields([{name: 'Review_photo', maxCount: 1}]),
    [
        body('name').trim().notEmpty().withMessage('You must enter a pen name').bail()
            .isLength({min: 3, max: 20}).withMessage('Pen name must be between 3 and 20 character long').bail()
            .custom((value, {req}) => {
                a = true
                return true
            }),

        body('rating').notEmpty().custom((value, {req}) => {
            if (req.body.rating < 1) {
                throw new Error('Rating must be not be below 1')
            }
            return true
        }).bail()
            .custom((value, {req}) => {
                if (req.body.rating > 5) {
                    throw new Error('Rating must not be above 5')
                }
                return true
            }).bail()
            .custom((value, {req}) => {
                b = true
                return true
            }),

        body('comment').trim().notEmpty().withMessage('You must enter a comment').bail()
            .isLength({min: 1, max: 255}).withMessage("A comment must be under 255 characters in length").bail()
            .custom((value, {req}) => {
                c = true
                return true
            }),
    ],
    (req, res) => {
        const violations = validationResult(req)
        console.log('Validation Results Violations')
        console.log(violations)

        // take the ugly violations onj and clean it up for display
        const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped()

        console.log(errorMessages)
        if (a && b && c) {
            reviews.push(new Review(
                req.body.rating,
                req.body.name,
                req.body.comment,
                currBook
            ))
            currBook = null

            res.render("Bookshelf",{
                reviews: reviews
            })
        } else {
            res.render("Review", {
                title: 'Review form',
                name: req.body.name,
                comment: req.body.comment,
                rating: req.body.rating,
                err: errorMessages
            })
        }
    })
module.exports = router;
