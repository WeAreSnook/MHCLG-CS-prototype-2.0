const express = require('express')
const router = express.Router()
const fs = require('fs')

// Add your routes here - above the module.exports line

const questionsPath = './app/data/questions.json';
let questions;
const sectionsPath = './app/data/sections.json';
let sections;

fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    questions = JSON.parse(data);
});
fs.readFile(sectionsPath, 'utf8', (err, data) => {
    if (err) {
      throw err;
    }
    sections = JSON.parse(data);
    // Convert category CSVs into array
    sections.forEach(section => {
        section.categories = section.categories.split(',');
    });
    
});

router.get('/prototype-2/question/:questionID', (req, res) => {
    const question = questions.find( ({ id }) => id === req.params.questionID );
    res.render('prototype-2/question', { question: question })
});

router.get('/prototype-2/assessment-index/', (req, res) => {
    res.render('prototype-2/assessment-index', { sections: sections })
});

module.exports = router
