const express = require('express')
const router = express.Router()
const fs = require('fs')

// Add your routes here - above the module.exports line

const dataPath = './app/data/questions.json';
let questions;

fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    questions = JSON.parse(data);
});

router.get('/prototype-2/question/:questionID', (req, res) => {
    const question = questions.find( ({ id }) => id === req.params.questionID );
    res.render('prototype-2/question', { question: question })
});

module.exports = router
