//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.use(session({
  secret:"Our little secret.",
  resave: false,
  saveuninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true,useUnifiedTopology: true, useFindAndModify: false });
mongoose.set("useCreateIndex" , true);
const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  accessLevel:String
});

const postSchema = {
  title: String,
  content: String
};

userSchema.plugin(passportLocalMongoose);

const Post = mongoose.model("Post",postSchema);

const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){
  Post.find({},function(err,posts){
  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts
    });
  });
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/compose", function(req, res){
  // if(req.isAuthenticated)
  //{
  //   User.findById(req.user.id , function(err,foundUser){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(foundUser.accessLevel==="admin"){
  //       res.render("compose");
  //     }else{
  //       res.redirect("/");
  //     }
  //   }
  // });
  //
  // }else{
  //   res.render("/login");
  // }
  res.redirect("/login");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err){
    if(!err){
      res.redirect("/");
    }
  });
});


app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

Post.findOne({_id: requestedPostId}, function(err, post){
        res.render("post", {
        title: post.title,
        content: post.content
        });
        });

      });

  app.post("/register",function(req,res){
    User.register({username:req.body.username} , req.body.password , function(err,user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/login");
        });
      }
    });


  });


app.post("/login",function(req,res){
    const user=new User({
      username:req.body.username,
      password:req.body.password
    });
    req.login(user,function(err){
      if(err){
        console.log(err);
      }else{
        passport.authenticate("local")(req,res,function(){
          if(req.user.accessLevel==="admin"){
            res.render("compose");
          }else{
            res.redirect("/");
          }
        });
      }
    });

  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});





/* <%  if(posts.length===1){ %>
    <h1><%=posts[i].title%></h1>
  <p>
  <%=posts[i].content.substring(0, 100) + " ..."%>
  <a href="/posts/<%=posts[i]._id%>">Read More</a>
  </p>
<%  }else{ %>


      <% }; %> */
