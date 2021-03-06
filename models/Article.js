var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
//NOTE: I did not include a summary of the article because the page I was scraping from did not have a sumary available but I really wanted to use that website.
var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true,
    unique: true
  }, 

  link: {
    type: String,
    required: true
  },
   
  saved: {
    type: Boolean,
    required: true,
    default: false
  },
  
  note: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]

});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
