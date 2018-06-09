// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (let i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    // $("#articles").append("<a href='"+data[i].link+"'> Read Article</a>");
    $('#articles').append(`
    <br/> 
    <div class="card">
       
    <div class="card-body">
        <h5 class="card-title"  data-id="${data[i]._id}">${data[i].title}</h5>
        
        <a href="${data[i].link}" class="btn btn-primary" target="_blank">Read Article</a>
        <span id="card${i}"></span>
    </div>
    </div>`
      
    )
    if (data[i].saved === false) {//Button to Save Article
      $("#card"+i).append(`
      <button type="button" class="btn btn-dark" data-id="${data[i]._id}" id="savearticle">Save Article</button>
      `);
      }
    
      if (data[i].saved === true) {//Button to Save Article
        $("#card"+i).append(`
        
        <span class="alert alert-success" role="alert">Article Saved!</span>
          `); 
      }

      // if (data[i].saved === true) {//Button to Save Article
      //   $("#card"+i).append(`
      //   <button type="button" class="btn btn-secondary" data-id="${data[i]._id}" id="deletearticle">Remove Article From Saved</button>
      //     `); 
      // }
  }

});

$.getJSON("/saved", function(data) {
  // For each one
  for (let i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    // $("#articles").append("<a href='"+data[i].link+"'> Read Article</a>");
    $('#saved-articles').append(`
    <br/> 
    <div class="card">
       
    <div class="card-body">
        <h5 class="card-title"  data-id="${data[i]._id}">${data[i].title}</h5>
        
        <a href="${data[i].link}" class="btn btn-primary">Read Article</a>
        <span id="card${i}"></span> <button type="button" class="btn btn-secondary" data-id="${data[i]._id}" id="deletearticle">Remove Article From Saved</button>
    </div>
    </div>`
      
    )
    // if (data[i].saved === false) {//Button to Save Article
    //   $("#card"+i).append(`
    //   <button type="button" class="btn btn-dark" data-id="${data[i]._id}" id="savearticle">Save Article</button>
    //   `);
    //   }
    
      // if (data[i].saved === true) {//Button to Save Article
      //   $("#card"+i).append(`
        
      //   <span class="alert alert-success" role="alert">Article Saved!</span>
      //     `); 
      // }

      
  }

});


/* <p class="card-text">With supporting text below as a natural lead-in to additional content.</p> */

// Whenever someone clicks a p tag
$(document).on("click", "#scrape", function() {

  event.preventDefault();

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // $('#myModal').modal('show');
      $("#myModal").show();
  });
  });

$(document).on("click", "#closemodal", function(){
  $("#myModal").hide();
})

// Whenever someone clicks a p tag
$(document).on("click", "h5", function() {
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
     
      $("#NotesModal").show();
      $("#modal-body").append("<p>Add a Note to this article</p>");
      // An input to enter a new title
      // $("#modal-body").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#modal-body").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#modal-footer").append(`<button type="button" data-id="${data._id}" id="savenote" class="btn btn-primary">Okay!</button>`);
      // if (data.saved === false) {//Button to Save Article
      //   $("#notes").append("<button data-id='" + data._id + "' id='savearticle'>Save Article</button>");
      //   }
      
      // if (data.saved === true) {//Button to Save Article
      //     $("#notes").append("<button data-id='" + data._id + "' id='deletearticle'>Delete Article</button>");
      // }

      if (data.note) {
        console.log(data.note[0].title);
        console.log(data.note.length);
          for (let i = 0; i < data.note.length; i++) { 
            $("#currentnote").append(`<div id="deletenote" note-id="${data.note[i]._id}"><span class="deletenotebutton" id="currentnote${i}">${data.note[i].body}</span><button class="btn btn-danger">X</button></div>`);
          // Place the title of the note in the title input
          // $("#currentnote"+i).text(data.note[i].title);
          // Place the body of the note in the body textarea
        }
        
      }

      

      

      // If there's a note in the article
     
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
 
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  
  if ($("#bodyinput").val() === ""){
    $("#NotesModal").hide();
  } else {
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
     
      $("#NotesModal").hide();
    });
  }
  // Also, remove the values entered in the input and textarea for note entry
  //$("#titleinput").val("");
  $("#currentnote").replaceWith(`<div id="currentnote"></div>`);
  $("#modal-body").replaceWith(`<div class="modal-body" id="modal-body"></div>`);
  $("#modal-footer").replaceWith(`<div class="modal-footer" id="modal-footer">`);
  

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
    $(this).replaceWith(""); 
  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  // $("#bodyinput").val("");

 // $("#deletenote").replaceWith("");
});


// When you click the savearticle button
$(document).on("click", "#savearticle", function() {
  // Grab the id associated with the article from the submit button

  $(this).replaceWith(`<span class="alert alert-success" role="alert">Article Saved!</span>`); 
  
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
      //Button to Save Article
        
      
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
  $(this).replaceWith(`<span class="alert alert-danger role="alert">Article Removed!</span>`);
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