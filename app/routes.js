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
const topicsPath = "./app/data/topics.json";
let topics;

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

fs.readFile(topicsPath, "utf8", (err, data) => {
  if (err) {
    throw err;
  }
  topics = JSON.parse(data);
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

router.get("/sprint-3/prototype-2/question/:questionID", (req, res) => {
  const question = questions.find(({ id }) => id === req.params.questionID);
  res.render("sprint-3/prototype-2/question", { question: question });
});

router.get("/sprint-3/prototype-2/topic/:topicSlug", (req, res) => {
  let topic = topics.find(({ slug }) => slug === req.params.topicSlug);
  // Convert question CSVs into an array of objects
  if (typeof topic.questions === "string") {
    let splitQuestions = topic.questions.split(",");
    let fullQuestions = [];
    splitQuestions.forEach((questionID) => {
      // Find question object by ID
      const fullQuestion = questions.find(({ id }) => id === questionID);
      fullQuestions.push(fullQuestion);
    });
    topic.questions = fullQuestions;
  }
  res.render("sprint-3/prototype-2/topic", { topic: topic });
});

router.get("/sprint-3/prototype-2/category/:categorySlug/", (req, res) => {
  const category = categories.find(
    ({ slug }) => slug === req.params.categorySlug
  );
  res.render("sprint-3/prototype-2/category", { category: category });
});

router.get("/sprint-3/prototype-2/category/:categorySlug/finished", (req, res) => {
  const category = categories.find(
    ({ slug }) => slug === req.params.categorySlug
  );
  res.render("sprint-3/prototype-2/category-finished", { category: category });
});

router.get("/sprint-3/prototype-1/question/:questionID", (req, res) => {
  const p1Questions = questions.filter(
    (question) => question.stage == "Stage 1"
  );
  const question = p1Questions.find(({ id }) => id === req.params.questionID);

  const currentIndex = p1Questions.indexOf(question);

  let nextQuestionHref;
  if (p1Questions.length - 1 != currentIndex) {
    nextQuestionHref =
      "/sprint-3/prototype-1/question/" + p1Questions[currentIndex + 1].id;
  } else {
    nextQuestionHref = "/sprint-3/prototype-1/confirmation";
  }

  let prevQuestionHref;
  if (currentIndex != 0) {
    prevQuestionHref =
      "/sprint-3/prototype-1/question/" + p1Questions[currentIndex - 1].id;
  } else {
    prevQuestionHref = "/sprint-3/prototype-1/start-assessment";
  }

  res.render("sprint-3/prototype-1/question", {
    question,
    prevQuestionHref,
    nextQuestionHref,
  });
});

router.get("/sprint-3/prototype-2/category/:categorySlug", (req, res) => {
  const category = categories.find(
    ({ slug }) => slug === req.params.categorySlug
  );
  res.render("sprint-3/prototype-2/category", { category: category });
});

router.get("/sprint-3/prototype-1/category/:categorySlug", (req, res) => {
  const category = categories.find(
    ({ slug }) => slug === req.params.categorySlug
  );
  const firstQuestionId = "1.1.1";
  res.render("sprint-3/prototype-1/category", { category, firstQuestionId });
});

router.get("/sprint-3/prototype-2/start-assessment/", (req, res) => {
  res.render("sprint-3/prototype-2/start-assessment", { sections: sections });
});

router.get("/sprint-3/prototype-2/result/", (req, res) => {
  res.render("sprint-3/prototype-2/result", { sections: sections });
});

router.get("/sprint-3/prototype-2/assessment-index/", (req, res) => {
  res.render("sprint-3/prototype-2/assessment-index", { sections: sections });
});

router.get("/sprint-3/prototype-1/start-assessment/", (req, res) => {
  res.render("sprint-3/prototype-1/start-assessment", { sections: sections });
});

router.get("/sprint-5/prototype-1/start-assessment/", (req, res) => {
  res.render("sprint-5/prototype-1/start-assessment", { sections: sections });
});

router.get("/sprint-5/prototype-1/category/:categorySlug", (req, res) => {
  const category = categories.find(
    ({ slug }) => slug === req.params.categorySlug
  );
  res.render("sprint-5/prototype-1/category", { category: category });
});

router.get("/sprint-5/prototype-1/risk", (req, res) => {
  const questions = req.session.data['questions'];
  let score = 0;
  for (const key in questions) {
    const question = questions[key];
    if(question.answer == 'yes') {
      const level = question.level;
      if (level == 'medium') {
        score++;
      }
      else if (level == 'high') {
        score = score + 2;
      }
    }
  }
  let riskLevel = 'high';
  if(score >= 7) {
    riskLevel = 'medium';
  }
  if(score >= 11) {
    riskLevel = 'low';
  }
  let riskSlug = riskLevel.replace(/ /g, '-');
  res.render("sprint-5/prototype-1/risk", { riskLevel: riskLevel, riskSlug: riskSlug, score: score, wrongQuestions: wrongQuestionsOnly(questions) });
});

// Returns an array of questions with the answer "no" or blank, sorted by level
function wrongQuestionsOnly(questions) {
  let wrongQuestions = [];
  for (const key in questions) {
    const question = questions[key];
    if(question.answer == 'no' || typeof question.answer === 'undefined') {
      wrongQuestions.push(question)
    }
  }
  wrongQuestions.sort(function(a, b) {
    var levelA = a.level.toUpperCase(); 
    var levelB = b.level.toUpperCase(); 
    if (levelA < levelB) {
      return -1;
    }
    if (levelA > levelB) {
      return 1;
    }
  
    // equal
    return 0;
  });
  return wrongQuestions;
}

module.exports = router;
