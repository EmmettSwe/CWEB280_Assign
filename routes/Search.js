var express = require('express');
var router = express.Router();

const {body, query, validation, validationResult} = require('express-validator')
const onlyMsgErrorFormatter = ({location, msg, param, value, nestedErrors}) => {
    return msg
}

/* GET handler for http://localhost:3000/ and http://localhost:3000/search/. */
router.get('/', function (req, res, next) {
    // Just render the form
    res.render('Search_Form', {
        title: 'Search Form'
    });
});
let passed1 = false
let passed = false
/* POST handler for http://localhost:3000/ */
router.post('/search',
    [
        body('sMethod').notEmpty().withMessage('You must use a search method').bail()
            .custom((value, {req}) => {
                if (req.body.sMethod === 'title' || req.body.sMethod === 'author') {
                    return true
                } else {
                    throw new Error('You must either search by "title" or "Author"')
                }
            }).bail()
            .custom((value, {req}) => {
                passed1 = true
                return true
            }),
        // Validation the search field
        body('search').notEmpty().withMessage('You must enter a value to search by').bail()
            .isLength({
                min: 1,
                max: 75
            }).withMessage('A search value must be no less than 1 and no greater than 75').bail()
            .custom((value, {req}) => {
                // if everything passed then true
                passed = true
                return true
            })
    ],
    // Because we are using a fetchData method the function needs to be asynchronous
    async function (req, res, next) {
        // check for valid input data
        const violations = validationResult(req)

        // Creating errorMessages object
        const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped()


        // If validation passed then we fetch the data and render the Search results
        if (passed && passed1) {
            // We call await so that the application knows not to move on
            // until it gets the data from the fetchData method
            passed =false
            passed1 =false
            let data = await fetchData(req.body.sMethod, req.body.search);
            res.render('Search_Result',
                {
                    // Title is dynamic to what they searched so that they remember
                    pageTitle: `Search results for ${req.body.search}`,
                    // We use syntactic sugar to have data: data
                    data
                });
        } else {
            passed =false
            passed1 =false
            // Pass the errors into the form
            res.render('Search_Form', {
                title: "Search Form",
                search: req.body.search,
                err: errorMessages
            })
        }
    })

/**
 * This method will return fetched data from the OpenLibrary API
 * @param method string of either "title" or "author" of which to query
 * @param search string of the value to search by
 * @returns {Promise<any>} the docs object which is returned from OpenLibrary and contains the search data
 */
const fetchData = (method, search) => {
    // fixing the search value so that it can be passed into the api request
    let string = search.replaceAll(" ", "+")
    // this template string takes in the query for method=searchValue
    return fetch(`https://openlibrary.org/search.json?${method}=${string}`)
        .then(res => {
            // Making sure that we got the response
            if (!res.ok) {
                throw new Error("Something went wrong");
            }
            // passing the parsed json to the next method
            return res.json();
        })
        .then(json => {
            // Overall returning the "docs" object from the API
            return json.docs;
        })
}

module.exports = router;