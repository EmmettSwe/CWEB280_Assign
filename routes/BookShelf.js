var express = require('express');
var router = express.Router();
class Book{
    constructor(title, author_name, cover_i, first_published_year) {
        this.title = title;
        this.author_name = author_name;
        this.cover_i = cover_i;
        this.first_published_year = first_published_year;
    }
}
class Review{
    constructor(rating, name, title, date, review, book) {
        this.rating = rating;
        this.name = name;
        this.rating = rating;
        this.review = review;
        this.book = book;
    }

}

let books = [
    new Book("1984", "owen" , "/images/untitled1.png","1930"),
    new Book("1924", "Bob" , "/images/untitled2.png","1910"),
    new Book("1910", "Joe" , "/images/untitled3.png","1900"),
]

let reviews = [
    new Review("5", "johnny cash", books[0].title, "Sep 13,2024", "This book is a very nice book!", books[0]),
    new Review("4", "johnny mash", books[1].title, "Sep 14,2024", "This book is a very bad book!", books[1]),
    new Review("3", "johnny flash", books[2].title, "Sep 15,2024", "This book is a very ok book!", books[2]),
]
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('Bookshelf', {
        title: 'Your Bookshelf',
        reviews: reviews
    });
});

module.exports = router;
