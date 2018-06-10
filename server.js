//REQUIREMENTS
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var request = require("request");
//var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();
var PORT = 3000;

// Set Handlebars as the default templating engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/goodnewsnetwork";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/goodnewsnetwork");



// ROUTES 

// NAVIGATION ROUTES
app.get("/", (req, res) => {
  res.render("index");
  console.log(req.user);
 
});

app.get("/saved-articles", (req, res) => {
  res.render("saved-articles");
  console.log(req.user);
 
});


// ROUTE FOR SCRAPING GOODNEWSNETWORK.COM
app.get("/scrape", function(req, res) {
  request("https://www.goodnewsnetwork.org/category/news/", function(error, response, html) {
//  axios.get("https://www.goodnewsnetwork.org/category/news/").then(function(response) {

    var $ = cheerio.load(html);
    // var $ = cheerio.load(response.data);

    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
    
    // Now, we grab every h5, and do the following:
    $("h3").each(function(i, element) {
      
      // Save an empty result object
      var result = {};
     
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");  

      //Create a Duplicate Variable
      var duplicate = false;

      //If title is already in database, change duplicate var to true
      for (let j=0; j < dbArticle.length; j++) {     
        if (result.title ===  dbArticle[j].title) {
          duplicate = true;
        } 
      }
  
      if (duplicate === false) {
        
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
            .then(function(dbArticle1) {
              // console.log(dbArticle1);
            })
            .catch(function(err) {
              return res.json(err);
            });        
      }
    });  
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });

  // If we were able to successfully scrape and save an Article, send a message to the client 
  res.send("scrape complete");
  });
});

// ALL ARTICLE-NOTES ROUTES
// ROUTE FOR ARTICLES & THEIR NOTES
app.get("/article-notes", function(req, res) {
  db.Article.find({})
  .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// ROUTE FOR GRABBING A SPECIFIC ARTICLE BY ID
app.get("/article-notes/:id", function(req, res) {
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

// ROUTE FOR SAVING A NOTE TO AN ARTICLE
app.post("/article-notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note.
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
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


// ALL NOTES ROUTES
// ROUTE FOR FINDING ALL NOTES
app.get("/notes", function(req, res) {
  db.Note.find({}) 
    .then(function(dbNotes) {
      res.json(dbNotes);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// ROUTE FOR GRABBING A SPECIFIC NOTE BY ID
app.get("/notes/:id", function(req, res) {
  db.Note.findOne({ _id: req.params.id })
    .then(function(dbNotes) {
      res.json(dbNotes);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// ROUTE FOR DELETING A SPECIFIC NOTE
app.post("/notes/:id", function(req, res) {
  db.Note.remove({ _id: req.params.id })
    .then(function(dbNote) {
      return db.Note.findOneAndUpdate({ _id: req.params.id }, { justOne: true});
    })
    .then(function(dbNotes) {
      res.json(dbNotes);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// ALL SAVED ROUTES
// ROUTE FOR ALL SAVED ARTICLES
app.get("/saved", function(req, res) {
  db.Article.find({ saved: true }, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

// ROUTE FOR ALL SAVED ARTICLES
app.get("/saved/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// ROUTE TO REMOVE ARTICLE FROM SAVED
app.post("/saved/:id", function(req, res) {
  db.Article.update(
    {_id: mongojs.ObjectId(req.params.id)},
    {$set: {saved: false}},
    function(error, edited) {
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // console.log(edited);
        res.send(edited);
      }
    }
  );
});

// ALL ARTICLES ROUTES
// ROUTE FOR ALL ARTICLES
app.get("/articles", function(req, res) {
  db.Article.find({ }, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

// ROUTE FOR ALL ARTCILES BY ID
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    // and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


// ROUTE FOR SAVING ARTICLES
app.post("/articles/:id", function(req, res) {
  
  // //REMOVE ARTICLE BUTTON (NEEDED TO CLEAR FROM MLAB DATABASE)
  //   db.Article.remove({ _id: req.params.id })
  //     .then(function(dbArticle) {
  //       return db.Article.findOneAndUpdate({ _id: req.params.id }, { justOne: true});
  //     })
  //     .then(function(dbNotes) {
  //       res.json(dbArticle);
  //     })
  //     .catch(function(err) {
  //       res.json(err);
  //     });

  //////////////////////////////
  db.Article.update(
    {_id: mongojs.ObjectId(req.params.id)},
    {$set: {saved: true}},
    function(error, edited) {
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // console.log(edited);
        res.send(edited);
      }
    }
  );
  ///////////////////////////
  
});



// Start the server
app.listen(process.env.PORT || PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

// app.listen(PORT, function() {
//   console.log("App running on port " + PORT + "!");
// });