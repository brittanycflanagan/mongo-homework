// Grab the articles as a json & show on page w/ appropriate buttons
$.getJSON("/articles", function(data) { //show on articles page
  for (let i = 0; i < data.length; i++) {
    $('#articles').append(`
    <br/> 
    <div class="card"> 
    <div class="card-body">
        <h5 class="card-title">${data[i].title}</h5>
        <a href="${data[i].link}" class="btn btn-primary" target="_blank">Read Article</a> <button class="btn btn btn-info" target="_blank" id="addNote" data-id="${data[i]._id}">Add Notes</button>
        <span id="card${i}"></span>
    </div>
    </div>`)

   if (data[i].saved === false) { //Button to Save Article
      $("#card"+i).append(`<button type="button" class="btn btn-dark" data-id="${data[i]._id}" id="savearticle">Save Article</button>`);
    }
    
   if (data[i].saved === true) {//Alert that article is already saved
      $("#card"+i).append(`<span class="alert alert-success" role="alert">Article Saved!</span>`); 
    }
  }
});

//get saved articles & show on page 
$.getJSON("/saved", function(data) { 
  for (let i = 0; i < data.length; i++) {
    $('#saved-articles').append(`
    <br/> 
    <div class="card">   
    <div class="card-body">
        <h5 class="card-title"  data-id="${data[i]._id}">${data[i].title}</h5>
        <a href="${data[i].link}" class="btn btn-primary">Read Article</a>
        <span id="card${i}"></span> <button class="btn btn btn-info" target="_blank" id="addNote" data-id="${data[i]._id}">Add Notes</button> 
        <button type="button" class="btn btn-secondary" data-id="${data[i]._id}" id="deletearticle">Remove Article From Saved</button>
    </div>
    </div>`)    
  }
});

//show modal & do AJAX call when scrape button is pushed
$(document).on("click", "#scrape", function() {
  event.preventDefault();
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .then(function(data) {
    //console.log(data);
    $("#myModal").show();
  });
});

//close scrape modal when click okay button & reload page
$(document).on("click", "#closemodal", function(){
  $("#myModal").hide();
  location.reload();
})

// Show notes modal when add note button is pushed
$(document).on("click", "#addNote", function() {
  $("#notes").empty();
  $("#button").empty();
  var thisId = $(this).attr("data-id");
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/article-notes/" + thisId
  })
  .then(function(data) {
      //console.log(data);
    $("#NotesModal").show();
    $("#modal-body").append("<p>Add a Note to this article</p>");
    $("#modal-body").append("<textarea id='bodyinput' name='body'></textarea>");
    $("#modal-footer").append(`<button type="button" data-id="${data._id}" id="savenote" class="btn btn-primary">Okay!</button>`);
    if (data.note) { // If there's a note associated with the article...
      for (let i = 0; i < data.note.length; i++) { 
        $("#currentnote").append(`<div id="deletenote" note-id="${data.note[i]._id}"><span class="deletenotebutton" id="currentnote${i}">${data.note[i].body}</span>
        <button class="btn btn-danger">X</button></div>`);
      }  
    }
  });
});

// When you click the save note button...
$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");
  //if note field is blank then don't add the note to the database
  if ($("#bodyinput").val() === ""){
    $("#NotesModal").hide();
  } else {
  // Run a POST request to change add note to the database
  $.ajax({
    method: "POST",
    url: "/article-notes/" + thisId,
    data: {
      body: $("#bodyinput").val()
    }
  })
    .then(function(data) {
       console.log(data);
      $("#NotesModal").hide();
    });
  }
  // reset the values back to prevent content from appearing multiple times
  $("#currentnote").replaceWith(`<div id="currentnote"></div>`);
  $("#modal-body").replaceWith(`<div class="modal-body" id="modal-body"></div>`);
  $("#modal-footer").replaceWith(`<div class="modal-footer" id="modal-footer">`); 
});

//Delete note button
$(document).on("click", "#deletenote", function() {
  var thisId = $(this).attr("note-id");
  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
  })
    .then(function(data) {
      console.log(data);
    });
    $(this).replaceWith(""); 
});


//Save article button
$(document).on("click", "#savearticle", function() {
  $(this).replaceWith(`<span class="alert alert-success" role="alert">Article Saved!</span>`); 
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
  })
    .then(function(data) {
      console.log(data);
    });
});

// When you click the delete article button remove from saved list
$(document).on("click", "#deletearticle", function() {
  var thisId = $(this).attr("data-id");
  $(this).replaceWith(`<span class="alert alert-danger role="alert">Article Removed!</span>`);
  $.ajax({
    method: "POST",
    url: "/saved/" + thisId,
  })
  .then(function(data) {
    console.log(data);
  });
});