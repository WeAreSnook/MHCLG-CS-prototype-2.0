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
const s6QuestionsPath = "./app/data/sprint6-questions.json";
let s6Questions;
let s6Classifiers = [];
s6Classifiers.questions = {};

const trim_regexp = /^\"?[\n\s]*(.+?)[\n\s]*\"?$/gm;
const subst = `$1`;
const assessmentTypes = [
  {key:"CE", objectName:"CyberEssentials"},
  {key:"PSN", objectName: "PSN"},
  {key:"PCI", objectName: "PCI"},
  {key:"GDPR", objectName: "GDPR"},
  {key:"NHSDSPT", objectName: "NHS DSPT"},
  {key:"ISO 27001", objectName: "ISO27001"},
];

const assessments = {
  "gdpr" : {
    short_name: "GDPR",
    access_key: "GDPR",
    long_name: "General Data Protection Regulation (GDPR)",
    intro_text: "\n" +
      "The General Data Protection Regulation (GDPR) is a piece of UK & EU-wide legislation which determines how people’s personal data is processed and kept safe, and the legal rights individuals have in relation to their own data. It has been in place since 25 May 2018 and applies to organisations that process or handle personal data, including councils and local authorities"
  }
}

const classifications = ["category", "topic", "section", "stage"];

function clone(a) {
  return JSON.parse(JSON.stringify(a));
}

function copyQuestionObject(objectToCopy, keysToCopy  ){
  let copyTo = {};
  keysToCopy.forEach(function(key){
    copyTo[key.toLowerCase()] = objectToCopy[key].trim();
  });
  return copyTo;
}

fs.readFile(s6QuestionsPath, "utf8", (err, data) => {
  if (err) {
    throw err;
  }

  s6Questions = JSON.parse(data);
  //console.log(s6Questions.slice(0,3));
  s6Questions.forEach(function(question){

    question.topic = question.topic.trim().replace(trim_regexp, subst);
    const questionObject = copyQuestionObject(question, ["id", "label","category", "topic", "section", "stage", "Type"] )

    // this is for creating an index of all of the questions
    s6Classifiers.questions[questionObject.id] = questionObject

    // this is for saving all of the standards into a collection
    assessmentTypes.forEach(function(type){

      if(!question[type.objectName] || !Array.isArray(question[type.objectName])){
        question[type.objectName] = [];
      }

      if (!s6Classifiers[type.objectName]){
        s6Classifiers[type.objectName] = [];
      }

      if(question[type.key]){
        let questionObjectInstance = clone(questionObject);
        questionObjectInstance.reference = question[type.key];
        s6Classifiers[type.objectName].push(questionObject);
        questionObjectInstance = null
      }
    })

    // this is for saving all of the classifications into a collection
    classifications.forEach(function(group){
      if (question[group]){
        if(!s6Classifiers[group]){
          s6Classifiers[group]={};
        }
        if( !s6Classifiers[group][questionObject[group]] ||
            !Array.isArray(s6Classifiers[group][questionObject[group]])) {
          s6Classifiers[group][questionObject[group]] = [];
        }
        s6Classifiers[group][questionObject[group]].push(questionObject)
      }
    })
  });

  //console.log(s6Classifiers);


});



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

// Prototype 6

router.get("/sprint-6/prototype/all-questions-overview/", (req, res) => {
  res.render("sprint-6/prototype/all-questions-overview", { sections: sections });
});

router.get("/sprint-6/prototype/:pathWay/question/:questionID", (req, res) => {

  const question = s6Classifiers.questions[req.params.questionID];
  const pathway  = req.params.pathWay;


  // if we are passed a url variable for an expert review then redirect somewhere?

  res.render("sprint-6/prototype/question", {
    question,
    pathway
  });

});


router.get("/sprint-6/prototype/:pathWay/question/:questionID/workingtowards", (req, res) => {

  const question = s6Classifiers.questions[req.params.questionID];
  const pathway  = req.params.pathWay;


  // if we are passed a url variable for an expert review then redirect somewhere?

  res.render("sprint-6/prototype/workingtowards", {
    question,
    pathway
  });
});


router.post("/sprint-6/prototype/:pathWay/question/:questionID/workingtowards", (req, res) => {

  const question = s6Classifiers.questions[req.params.questionID];

    let completed = false
    if (req.body.answer === "workingtowards") {
      completed = true
    }
    console.log("Adding session data", req.body);

    req.session.question_data[req.params.questionID] = {
      "answer": "workingtowards",
      "complete": completed,
      "workingtowards_date": req.body["workingtowards-day"] + '/' + req.body["workingtowards-month"] + '/' + req.body["workingtowards-year"]
    }

    res.redirect("../..");

});

router.get("/sprint-6/prototype/:pathWay/question/:questionID/metwithexceptions", (req, res) => {

  const question = s6Classifiers.questions[req.params.questionID];
  const pathway  = req.params.pathWay;

  res.render("sprint-6/prototype/metwithexceptions", {
    question,
    pathway
  });
});


router.post("/sprint-6/prototype/:pathWay/question/:questionID/metwithexceptions", (req, res) => {

  const question = s6Classifiers.questions[req.params.questionID];

    let completed = false
    if (req.body.answer === "metwithexceptions") {
      completed = true
    }

    req.session.question_data[req.params.questionID] = {
      "answer": "metwithexceptions",
      "complete": completed,
      "metwithexceptions": req.body["metwithexceptions"]
    }

    res.redirect("../..");

});


router.post("/sprint-6/prototype/:pathWay/question/:questionID/riskaccepted", (req, res) => {

    let completed = false
    if (req.body.answer === "riskaccepted") {
      completed = true
    }

    req.session.question_data[req.params.questionID] = {
      "answer": "riskaccepted",
      "complete": completed,
      "riskaccepted": req.body["riskaccepted"]
    }

    res.redirect("../..");

});

router.get("/sprint-6/prototype/:pathWay/question/:questionID/riskaccepted", (req, res) => {
  const question = s6Classifiers.questions[req.params.questionID];
  const pathway  = req.params.pathWay;

  // if we are passed a url variable for an expert review then redirect somewhere?
  res.render("sprint-6/prototype/riskaccepted", {
    question,
    pathway
  });

});


router.post("/sprint-6/prototype/:pathWay/question/:questionID/metwithexceptions", (req, res) => {

  // NTH:  if it is blank we should display some validation?

  // NTH: if a skip parameter has been set, we should route to the next question

  // save valid results in the session

  const question = s6Classifiers.questions[req.params.questionID];

  if (!question.type || question.type === "standard_radio") {

    let completed = false
    if (req.body.exceptionsentered) {
      completed = true
    }
    
    req.session.question_data[req.params.questionID] = {
      "answer": "metwithexceptions",
      "complete": completed,
      "exceptions": req.body.exceptionsentered
    }
    
    console.log(req.session.question_data);
    res.redirect("../..");

  }
});


router.post("/sprint-6/prototype/:pathWay/question/:questionID/riskaccepted", (req, res) => {

  // NTH:  if it is blank we should display some validation?

  // NTH: if a skip parameter has been set, we should route to the next question

  // save valid results in the session

  const question = s6Classifiers.questions[req.params.questionID];

  if (!question.type || question.type === "standard_radio") {

    let completed = false
    if (req.body.riskacceptedentered) {
      completed = true
    }
    
    req.session.question_data[req.params.questionID] = {
      "answer": "riskaccepted",
      "complete": completed,
      "riskaccepted": req.body.riskacceptedentered
    }
    
    console.log(req.session.question_data);
    res.redirect("../..");

  }
});

router.post("/sprint-6/prototype/:pathWay/question/:questionID", (req, res) => {

  // NTH:  if it is blank we should display some validation?

  // NTH: if a skip parameter has been set, we should route to the next question

  // save valid results in the session

  const question = s6Classifiers.questions[req.params.questionID];

  if ( ! question.type || question.type === "standard_radio"){

    let completed = false
    let special_case = false
    if( req.body.answer === "met" ) {
      completed = true
    } else if( req.body.answer === "riskaccepted" || req.body.answer === "metwithexceptions" ||req.body.answer === "workingtowards"   ) {
      special_case = true
    }

    if(!req.session.question_data){
      req.session.question_data = [];
    }
    req.session.question_data[req.params.questionID] = {
      "answer" : req.body.answer,
      "complete" : completed
    }
    // if the options were special we need redirect to the appropriate special route (e.g. riskaccepted, metwithexceptions, workingtowards )
    if( special_case ) { res.redirect(req.params.questionID+"/"+req.body.answer) }
    else{
      res.redirect("..");
    }    // for met or for not met, go to the index...

  }


  console.log(req.params);
  console.log(req.session);



});

router.get("/sprint-6/prototype/council-overview", (req, res) => {
  res.render("sprint-6/prototype/council-overview")
})


router.get("/sprint-6/prototype/:pathWay", (req, res) => {
  const pathway_key  = req.params.pathWay;
  const pathway = assessments[pathway_key];
  let pathway_questions = s6Classifiers[pathway.access_key]

  const table_header = [
    {
      text: "Risk"
    },
    {
      text: "Topic"
    },
    {
      text: "Control"
    },
    {
      text: "Status"
    },
    {
      text: "Action"
    }
  ];

  let table_rows = pathway_questions.map(function(this_row) {

    let tag = ""
    // calculate a rand value from 0 - 100 based on a seed?

    // calculate the html of the status

    if (!req.session){
      req.session = {};
    }

    if (!req.session.question_data){
      req.session.question_data = {};
    }

    if (req.session.question_data[this_row.id])
    {
      let answer = req.session.question_data[this_row.id].answer

      console.log("answer",answer);

      if (answer === "met") {
        tag = "<strong class='govuk-tag govuk-tag--green'>Met</strong>"
      } else if (answer === "notmet") {
        tag = "<strong class='govuk-tag govuk-tag--red'>Not Met</strong>"
      } else if ( answer === "riskaccepted" ) {
        tag = "<strong class='govuk-tag govuk-tag--pink'>Risk Accepted</strong>"
      } else if ( answer === "workingtowards" ) {
        tag = "<strong class='govuk-tag govuk-tag--yellow'>Working Towards</strong>"
      } else if ( answer === "metwithexceptions" ) {
        tag = "<strong class='govuk-tag govuk-tag--green'>Met with exceptions</strong>"
      }
    } else {
      tag = "<strong class='govuk-tag govuk-tag--blue'>Not Answered</strong>"
    }

    // generate the question url

    let question_url = "/sprint-6/prototype/"+pathway_key+"/question/"+this_row.id;
    let view_link = "<a href='"+question_url+"'>View</a>";

    return  [
      {
        text: "3"
      },
      {
        text: this_row.topic
      },
      {
        text: this_row.label
      },
      {
        html: tag
      },
      {
        html: view_link
      }
    ];
  });

  res.render("sprint-6/prototype/pathway-overview", {
    pathway,
    table_header,
    table_rows
  });
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
