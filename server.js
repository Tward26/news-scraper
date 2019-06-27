// variable declaration
require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const exphbs = require('express-handlebars');

// Require all models
const db = require('./models');

const PORT = 3000 || process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';


// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger('dev'));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

// Handlebars
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main'
  })
);
app.set('view engine', 'handlebars');

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//helper function
const createArticle = article => {
  db.Article.create(article)
    .then(function (dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, log it
      console.log(err);
    });
};

// API Routes

//scrape route that creates articles
app.get('/api/scrape', (req, res) => {
  axios.get('https://www.belloflostsouls.net/').then(response => {
    let $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $('article').each(function (i, element) {
        // Save an empty result object
        let result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children('h2')
          .children('a')
          .text();
        result.link = $(this)
          .children('h2')
          .children('a')
          .attr('href');
        result.summary = $(this)
          .children('p')
          .text();

        db.Article.find({}, (err, docs) => {
        if (docs.length === 0) {
          createArticle(result);
        }
        let docFilter = docs.filter(doc => (doc.link === result.link));
        if(docFilter.length === 0){
          createArticle(result);
        }
      });


    });
    // Send a message to the client
    res.send('Scrape Complete');
  });
});

//delete all articles
app.get('/api/clear', (req, res) => {
  db.Article.deleteMany({}).then(function (deleted) {
    // If we were able to successfully update an Article, send it back to the client
    res.json(deleted);
  })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//get all unsaved articles
app.get('/api/articles/unsaved', (req, res) => {
  db.Article.find({saved: false}).then(dbArticle => {
    res.json(dbArticle);
  })
    .catch(function (err) {
    res.json(err);
  });
});

//get all saved articles
app.get('/api/articles/saved', (req, res) => {
  db.Article.find({saved: true}).then(dbsavedArticle => {
    res.json(dbsavedArticle);
  })
    .catch(function (err) {
    res.json(err);
  });
});

//save article route
app.get('/api/articles/save/:id', (req, res) => {
  db.Article.findOneAndUpdate({_id: req.params.id}, {saved: true}, { new: true, useFindAndModify: false }) .then(function(dbArticle) {
    // If we were able to successfully update an Article, send it back to the client
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/api/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/api/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//delete saved article
app.get('/api/articles/delete/:id', (req, res) => {
  db.Article.deleteOne({_id: req.params.id}).then(deleted => {
    res.json(deleted)
  })
    .catch(err => {
      res.json(err);
    });
});


//html routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/saved', (req, res) => {
  res.render('saved');
});


// Start the server
app.listen(PORT, function () {
  console.log('App running on port ' + PORT + '!');
});