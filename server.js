// variable declaration
require('dotenv').config();
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const exphbs = require('express-handlebars');

// Require all models
const db = require("./models");

const PORT = 3000 || process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";


// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

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

// Routes
app.get('/scrape', (req, res) => {
    axios.get('https://www.belloflostsouls.net/').then(response => {
      let $ = cheerio.load(response.data);
         // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
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
          .attr("href");
        result.summary = $(this)
          .children('p')
          .text();
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });  
       // Send a message to the client
    res.send("Scrape Complete");
    });
});

// needs more, placeholder get route
app.get("/", (req, res) => {
      res.render("index");
    });


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });