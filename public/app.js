// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    $("#articles").append("<a href='"+data[i].link+"'> Read Article</a>");
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  $("#button").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/article-notes/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
     

      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      if (data.saved === false) {//Button to Save Article
        $("#notes").append("<button data-id='" + data._id + "' id='savearticle'>Save Article</button>");
        }
      
      if (data.saved === true) {//Button to Save Article
          $("#notes").append("<button data-id='" + data._id + "' id='deletearticle'>Delete Article</button>");
      }

      if (data.note) {
        console.log(data.note[0].title);
        console.log(data.note.length);
          for (let i = 0; i < data.note.length; i++) { 
            $("#notes").prepend("<div id='currentnote"+i+"'></div><button note-id='" + data.note[i]._id + "' id='deletenote'>Delete Note</button>");
          // Place the title of the note in the title input
          $("#currentnote"+i).text(data.note[i].title);
          // Place the body of the note in the body textarea
          $("#currentnote"+i).text(data.note[i].body);
        }
        
      }

      

      

      // If there's a note in the article
     
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/article-notes/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

///////////
$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("note-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
    // data: {
    //   // Value taken from title input
    //   title: $("#titleinput").val(),
    //   // Value taken from note textarea
    //   body: $("#bodyinput").val()
    // }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      // $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  // $("#bodyinput").val("");
});


// When you click the savearticle button
$(document).on("click", "#savearticle", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    // data: {
    //   // Value taken from title input
    //   saved: true
    // }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      // $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  // $("#bodyinput").val("");
});

// When you click the deletearticle button
$(document).on("click", "#deletearticle", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/saved/" + thisId,
    // data: {
    //   // Value taken from title input
    //   saved: true
    // }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      // $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  // $("#bodyinput").val("");
});