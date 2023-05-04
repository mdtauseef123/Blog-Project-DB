const express = require("express");
const bodyParser = require("body-parser");
const lodash = require("lodash");

//Setting up the Database
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/blogs");
const post_schema = {
  post_title: String,
  post_content: String
};
const Post=mongoose.model("Post",post_schema);


//Setting up the starting content
const home_starting_content = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const about_content = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contact_content = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


//Setting up the server and ejs
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//GET requests for Home Page
app.get("/", function(req,res){
  Post.find().then(function(post_list){
      res.render("home",{
        home_content: home_starting_content,
        posts: post_list
      });
  });
});


//GET request for about page
app.get("/about", function(req,res){
  res.render("about", {
    about_content: about_content
  });
});


//GET request for contact page
app.get("/contact", function(req,res){
  res.render("contact", {
    contact_content: contact_content
  });
});


//GET request for compose page
app.get("/compose", function(req,res){
  res.render("compose");
});



//POST request for compose page
app.post("/compose", function(req,res){
  const post_obj = new Post({
    post_title: req.body.post_title,
    post_content: req.body.post_content
  });
  /*
  At some moment which is very rare, when we compose a post and redirect to the root route,
  sometimes the post is not yet saved and doesn’t show up on the home page.
  We will be adding a callback to the save method to only redirect 
  to the home page once save is complete with no errors.
  save() no longer accepting callback method so the following code will not work:-
  post_obj.save((err) => {
    if (!err) {
      res.redirect("/");
    }
  });  
  */
  post_obj.save().then(()=>{
    console.log('Post added to DB.');
    res.redirect('/');
  })
  .catch(err => {
    res.status(400).send("Unable to save post to database.");
  });
});


//Related to the application of CSS in the posts page.If we just write href="css/styles.css" then it will work fine for all the single
//route pages like "http://localhost:3000/home" or "http://localhost:3000/about" etc., as it will start searching from "/" root location
//but if we have nested route like "http://localhost:3000/posts/test" which contains nested route then it will start searching 
//the static files like CSS style, the local javascript files, any local images or favicon with "/posts" location which ofcourse will 
//not able to fetch that static files.
//So in order to make it always work then we will have to start searching always from root location. 
//Hence we will always have to put / before any static files like following:- 
// href="/css/styles.css". The "/" before css helps in finding the static files from root level hierarchy in all situations.


//GET request for posts/post_name request
var flag=0;
app.get("/posts/:post_name", function(req,res){
  var val = req.params.post_name;
  Post.find().then(function(post_list){
    post_list.forEach(function(each_post){
      if(lodash.lowerCase(each_post.post_title) === lodash.lowerCase(val)){
        flag=1;
        res.render("post",{
          post_title: each_post.post_title,
          post_content: each_post.post_content
        });
      }
    });
    if(flag === 0)
    res.render("error");
    if(flag===1)
    flag=0;
  });
});


//Listening to the port 3000.
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
