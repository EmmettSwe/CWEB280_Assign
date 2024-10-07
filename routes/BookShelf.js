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
            a =false
            b =false
            c =false
            console.log(req.files)
            const file1 = req.files.Review_photo?.[0] ?? {orginalname: 'Not Uploaded'}

            const images = []
            let imagetemp
            // eslint-disable-next-line n/no-path-concat
            for (const [fileInputName, fileInfoArray] of Object.entries(req.files)) {
                for (const tempFileInfo of fileInfoArray) {
                    moveFile(tempFileInfo, `${__dirname}/../public/images/`)

                    // if the is an error message for the file's fieldname
                    if (tempFileInfo.fieldname in errorMessages
                    ) {
                        // Delete temporary uploaded file if there is an error in the filed name
                        fs.unlink(tempFileInfo.path, (err) => {
                            if (err) throw err
                            console.log('File removed at ' + tempFileInfo.path)
                        })
                    } else {
                        // call the move file function to move the file to public/images folder
                        moveFile(tempFileInfo, __dirname + '/../public/images/')
                    }

                    tempFileInfo.displayPath = '/images/' + tempFileInfo.filename + '-' + tempFileInfo.orginalname
                    imagetemp = '/images/' + tempFileInfo.filename + '-' + tempFileInfo.originalname
                    images.push(imagetemp)
                }
            }

            reviews.push(new Review(
                req.body.rating,
                req.body.name,
                req.body.comment,
                currBook,
                imagetemp
            ))
            currBook = null
            imagetemp = null

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
function moveFile (tempfileInfo, newPath) {
    newPath += tempfileInfo.filename + '-' + tempfileInfo.originalname
    fs.rename(tempfileInfo.path, newPath, (err) => {
        if (err) {
            console.error(err)
        }
    })
}
module.exports = router;
