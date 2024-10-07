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

            if (file.mimetype.startsWith('image/')) {
                callback(null, true)
            } else {

                return callback(new Error('Only images are allowed'), false)
            }
        },
        limits: {
            //2MB max file size
            fileSize: 2 * 1024 * 1024
        }
    })

/**
 * Book class that stores all the info that we could want about the book
 * title
 * author
 * image
 * year
 */
class Book {
    constructor(title, author_name, cover_i, first_published_year) {
        this.title = title;
        this.author_name = author_name;
        this.cover_i = cover_i;
        this.first_published_year = first_published_year;
    }
}

/**
 * Review class that stores the review
 * rating 1-5
 * name
 * coments/review
 * book being reviewed
 * the optioanlly uploaded image
 */
class Review {
    constructor(rating, name, review, book, img) {
        this.rating = rating;
        this.name = name;
        this.rating = rating;
        this.review = review;
        this.book = book;
        this.img = img;
        this.hasPhoto = img !== undefined
    }

}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('Bookshelf', {
        title: 'Your Bookshelf',
        reviews: reviews
    });
});
/**
 * Init all variables that we will need globally
 * @type {*[]}
 */
let books = []
let reviews = []
let currBook
// not ideal but couldn't figure out how to decide whether we want to render the page again because of bad form input (missing notes)
// using these instead with custom validator to see if we get to the end of the validation chain without bailing
let a = false
let b = false
let c = false
router.get('/Review', function (req, res, next) {
    //make a book
    currBook = new Book(
        req.query.title,
        req.query.author_name,
        `https://covers.openlibrary.org/b/id/${req.query.image}-M.jpg`,
        req.query.first_published_year)
    books.push(currBook) // add book to storage
    // render the review page
    res.render('Review', {
        title: req.query.title
    });
});
/**
 * Validation
 *      pen name must be present and in a range of 3 to 20 characters
 *      rating must be a value from 1 to 5 (possible for a value of 1.5 to be inputted b user would have to modify html)
 *      comments must be a minimum of 20 character and max of 255
 */
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
            .isLength({min: 20, max: 255}).withMessage("A comment must be under 255 characters in length").bail()
            .custom((value, {req}) => {
                c = true
                return true
            }),
    ],
    (req, res) => {
        const violations = validationResult(req)
        const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped()

        // gross if statement
        if (a && b && c) {
            a = false
            b = false
            c = false
            console.log(req.files)
            const file1 = req.files.Review_photo?.[0] ?? {orginalname: 'Not Uploaded'}

            const images = []
            let imagetemp
            for (const [fileInputName, fileInfoArray] of Object.entries(req.files)) {
                for (const tempFileInfo of fileInfoArray) {
                    moveFile(tempFileInfo, `${__dirname}/../public/images/`)

                    if (tempFileInfo.fieldname in errorMessages
                    ) {
                        fs.unlink(tempFileInfo.path, (err) => {
                            if (err) throw err
                            console.log('File removed at ' + tempFileInfo.path)
                        })
                    } else {
                        moveFile(tempFileInfo, __dirname + '/../public/images/')
                    }
                    tempFileInfo.displayPath = '/images/' + tempFileInfo.filename + '-' + tempFileInfo.orginalname\
                    // Save to add to the review object
                    imagetemp = '/images/' + tempFileInfo.filename + '-' + tempFileInfo.originalname
                    images.push(imagetemp)
                }
            }
            /**
             * make review and reset some values
             */
            reviews.push(new Review(
                req.body.rating,
                req.body.name,
                req.body.comment,
                currBook,
                imagetemp
            ))
            currBook = null
            imagetemp = null
            // Show all the users session reviews
            res.render("Bookshelf", {
                reviews: reviews
            })
        } else {
            // If the validation found and error render page again with the values they had inputted
            res.render("Review", {
                title: 'Review form',
                name: req.body.name,
                comment: req.body.comment,
                rating: req.body.rating,
                err: errorMessages
            })
        }
    })


function moveFile(tempfileInfo, newPath) {
    newPath += tempfileInfo.filename + '-' + tempfileInfo.originalname
    fs.rename(tempfileInfo.path, newPath, (err) => {
        if (err) {
            console.error(err)
        }
    })
}

module.exports = router;
