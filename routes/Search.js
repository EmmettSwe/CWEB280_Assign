var express = require('express');
var router = express.Router();

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
module.exports = router;