//REQUIREMENTS
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server

//*//
var request = require("request");
//var axios = require("axios");

var cheerio = require("cheerio");

// Require all models
var db = require("./models");
// Initialize Express
var app = express();

var PORT = 3000;

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

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

// Routes

app.get("/", (req, res) => {
  res.render("index");
  console.log(req.user);
 
});

app.get("/saved-articles", (req, res) => {
  res.render("saved-articles");
  console.log(req.user);
 
});


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {

  //*//
  request("https://www.goodnewsnetwork.org/category/news/", function(error, response, html) {
//  axios.get("https://www.goodnewsnetwork.org/category/news/").then(function(response) {

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    
    //*//
    var $ = cheerio.load(html);
    // var $ = cheerio.load(response.data);


    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
         //console.log("JUST ONE:"+dbArticle[1].title);
    
    // Now, we grab every h2 within an article tag, and do the following:
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


      var duplicate = false;
     // console.log("LENGTH:"+dbArticle.length);
          for (let j=0; j < dbArticle.length; j++) {
            // console.log("DBARTICLE TITLE:"+dbArticle[j].title);        
           if (result.title ===  dbArticle[j].title) {
             duplicate = true;
            } 
        }

        if (duplicate === false) {

          // Create a new Article using the `result` object built from scraping
          db.Article.create(result)
            .then(function(dbArticle1) {
              // View the added result in the console
              // console.log(dbArticle1);
            })
            .catch(function(err) {
              // If an error occurred, send it to the client
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

// Route for getting all Articles from the db
app.get("/article-notes", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
  .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
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

// Route for saving/updating an Article's associated Note
app.post("/article-notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
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

// Route for getting all Articles from the db
app.get("/notes", function(req, res) {
  // Grab every document in the Articles collection
  db.Note.find({})
 
    .then(function(dbNotes) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbNotes);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/notes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Note.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
   // .populate("note")
    .then(function(dbNotes) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbNotes);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.remove({ _id: req.params.id })
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Note.findOneAndUpdate({ _id: req.params.id }, { justOne: true});
    })
    .then(function(dbNotes) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbNotes);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


//Show Saved Articles
app.get("/saved", function(req, res) {
  // Go into the mongo collection, and find all docs where "read" is true
  db.Article.find({ saved: true }, function(error, found) {
    // Show any errors
    if (error) {
      console.log(error);
    }
    else {
      // Otherwise, send the books we found to the browser as a json
      res.json(found);
    }
  });
});

app.get("/saved/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    //.populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/saved/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  
  db.Article.update(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    {
      // Set "read" to true for the book we specified
      $set: {
        saved: false
      }
    },
    // When that's done, run this function
    function(error, edited) {
      // show any errors
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the result of our update to the browser
        console.log(edited);
        res.send(edited);
      }
    }
  );
    // .then(function(dbNote) {
    //   // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
    //   // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    //   // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    //   return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    // })
    // .then(function(dbArticle) {
    //   // If we were able to successfully update an Article, send it back to the client
    //   res.json(dbArticle);
    // })
    // .catch(function(err) {
    //   // If an error occurred, send it to the client
    //   res.json(err);
    // });
});


app.get("/articles", function(req, res) {
  // Go into the mongo collection, and find all docs where "read" is true
  db.Article.find({ }, function(error, found) {
    // Show any errors
    if (error) {
      console.log(error);
    }
    else {
      // Otherwise, send the books we found to the browser as a json
      res.json(found);
    }
  });
});

app.get("/articles/:id", function(req, res) {
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


app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  
   
  // //REMOVE ARTICLE BUTTON
  //   db.Article.remove({ _id: req.params.id })
  //     .then(function(dbArticle) {
       
  //       return db.Article.findOneAndUpdate({ _id: req.params.id }, { justOne: true});
  //     })
  //     .then(function(dbNotes) {
       
  //       res.json(dbArticle);
  //     })
  //     .catch(function(err) {
  //       //
  //       res.json(err);
  //     });

  

  //////////////////////////////
  db.Article.update(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    {
      // Set "read" to true for the book we specified
      $set: {
        saved: true
      }
    },
    // When that's done, run this function
    function(error, edited) {
      // show any errors
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the result of our update to the browser
        console.log(edited);
        res.send(edited);
      }
    }
  );

  ///////////////////////////

    // .then(function(dbNote) {
    //   // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
    //   // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    //   // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    //   return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    // })
    // .then(function(dbArticle) {
    //   // If we were able to successfully update an Article, send it back to the client
    //   res.json(dbArticle);
    // })
    // .catch(function(err) {
    //   // If an error occurred, send it to the client
    //   res.json(err);
    // });
});

// Start the server
// app.listen(PORT, function() {
//   console.log("App running on port " + PORT + "!");
// });

app.listen(process.env.PORT || PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});