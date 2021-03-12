const express = require("express");
const router = express.Router();
const fs = require("fs");

// Add your routes here - above the module.exports line

const questionsPath = "./app/data/questions.json";
let questions;
const sectionsPath = "./app/data/sections.json";
let sections;
const categoriesPath = "./app/data/categories.json";
let categories;

fs.readFile(questionsPath, "utf8", (err, data) => {
  if (err) {
    throw err;
  }
  questions = JSON.parse(data);
});
fs.readFile(sectionsPath, "utf8", (err, data) => {
  if (err) {
    throw err;
  }
  sections = JSON.parse(data);
  // Convert category CSVs into array
  sections.forEach((section) => {
    section.categories = section.categories.split(",");
  });
});
fs.readFile(categoriesPath, "utf8", (err, data) => {
  if (err) {
    throw err;
  }
  categories = JSON.parse(data);
  // Convert topic CSVs into array
  categories.forEach((category) => {
    category.topics = category.topics.split(",");
  });
});

router.get("/prototype-2/question/:questionID", (req, res) => {
  const question = questions.find(({ id }) => id === req.params.questionID);
  res.render("prototype-2/question", { question: question });
});

router.get("/prototype-1/question/:questionID", (req, res) => {
  const question = questions.find(({ id }) => id === req.params.questionID);
  const currentIndex = questions.indexOf(question);
  let nextId;
  if (questions.length - 1 != currentIndex) {
    nextId = questions[currentIndex + 1].id;
  } else {
    nextId = null;
  }
  let prevId;
  if (currentIndex != 0) {
    prevId = questions[currentIndex - 1].id;
  } else {
    prevId = null;
  }

  res.render("prototype-1/question", { question, prevId, nextId });
});

router.get("/prototype-2/category/:categorySlug", (req, res) => {
  const category = categories.find(
    ({ slug }) => slug === req.params.categorySlug
  );
  res.render("prototype-2/category", { category: category });
});

router.get("/prototype-1/category/:categorySlug", (req, res) => {
  const category = categories.find(
    ({ slug }) => slug === req.params.categorySlug
  );
  const firstQuestionId = "1.1.1";
  res.render("prototype-1/category", { category, firstQuestionId });
});

router.get("/prototype-2/start-assessment/", (req, res) => {
  res.render("prototype-2/start-assessment", { sections: sections });
});

router.get("/prototype-2/assessment-index/", (req, res) => {
  res.render("prototype-2/assessment-index", { sections: sections });
});

router.get("/prototype-1/start-assessment/", (req, res) => {
  res.render("prototype-1/start-assessment", { sections: sections });
});

module.exports = router;
