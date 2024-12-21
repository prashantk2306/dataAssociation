require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");

require("./config/db.config");
const userModel = require("./models/user.model");
const postModel = require("./models/post.model");
const authUser = require("./middlewares/authmiddlewares");
const isLoggedIn = require("./middlewares/isLoggedIn");

const app = express();

// Session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to something secret
  resave: false,
  saveUninitialized: true
}));

// Connect Flash middleware
app.set("view engine", "ejs");
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", isLoggedIn, (req, res) => {
  res.render("welcome");
});

app.post("/tweet", authUser, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send("Text is required to create a tweet.");
  }

  try {
    const tweet = new postModel({
      text,
      user: req.user._id, // Associating tweet with logged-in user
    });

    await tweet.save();

    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { posts: tweet._id },
    });

    res.redirect("/tweet");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while posting the tweet.");
  }
});

app.get("/tweet", authUser, async (req, res) => {
  try {
    const posts = (await postModel.find({}).populate("user")).reverse();
    res.render("tweet", { posts, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching posts.");
  }
});

// Like functionality
app.get('/like/:postId', authUser, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.postId).populate('user');
    if (!post) {
      return res.status(400).json({ success: false, message: 'Post does not exist' });
    }

    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    return res.redirect('/tweet');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// Edit Post Route (GET)
app.get('/edit/:postId', authUser, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.postId);
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).send('Not authorized');
    }
    res.render('editPost', { post });
  } catch (error) {
    res.status(500).send('Error');
  }
});

// Edit Post Route (POST)
app.post('/edit/:postId', authUser, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.postId);
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).send('Not authorized');
    }
    post.text = req.body.text; // Update the post text
    await post.save();
    res.redirect('/tweet'); // Redirect to the feed page after update
  } catch (error) {
    res.status(500).send('Error');
  }
});

app.get("/register", isLoggedIn, (req, res) => {
  res.render("register");
});

app.get("/profile", authUser, async (req, res) => {
  const user = req.user;
  res.render("profile", { user });
});

app.get("/login", isLoggedIn, (req, res) => {
  res.render("login", { messages: req.flash('error') });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (!user) {
    req.flash("error", "Wrong username or password.");
    return res.redirect("/login");
  }

  const isPassword = await bcrypt.compare(password, user.password);
  if (!isPassword) {
    req.flash("error", "Wrong username or password.");
    return res.redirect("/login");
  }

  const token = jwt.sign({ username, id: user.id },process.env.JWT_SECRET);
  res.cookie("token", token);

  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;
  const user = await userModel.findOne({ username });
  if (user) {
    req.flash("error", "User already exists.");
    return res.redirect("/login");
  }
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  const newUser = await userModel.create({
    name,
    username,
    email,
    password: hash
  });
  
  const token = jwt.sign({ username, id: newUser.id },process.env.JWT_SECRET);
  res.cookie("token", token);
  res.redirect("/profile");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
