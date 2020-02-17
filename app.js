const bodyParser = require("body-parser");
const express = require ("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/dePopplerDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.set("useCreateIndex", true);

const itemSchema = new mongoose.Schema({
    name: String,
    status: String
});

const Item = new mongoose.model("Item", itemSchema);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/closet", function(req, res) {
    Item.find({"status": "closet"}, function(err, foundItem) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("closet", {foundItem: foundItem});
        }
    });
});

app.get("/photod", function(req, res) {
    Item.find({"status": "photod"}, function(err, foundItem) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("photod", {foundItem: foundItem});
        }
    });
});

app.get("/listed", function(req, res) {
    Item.find({"status": "listed"}, function(err, foundItem) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("listed", {foundItem: foundItem});
        }
    });
});

app.get("/signup", function(req, res) {
    res.render("signup");
});

app.post("/", function(req, res) {
    const newItem = req.body.item;

    if (newItem) {
        const item = new Item({
            name: newItem,
            status: "closet"
        });
    
        item.save();
        res.redirect("/closet");
    } else {
        res.redirect("/");
    }
});

app.post("/change", function(req, res) {
    const moveCloset= req.body.moveCloset;
    const movePhotod= req.body.movePhotod;
    const moveListed= req.body.moveListed;
    const moveId = req.body.moveId;

    if (moveCloset == "closet") {
        Item.findOneAndUpdate(
            {_id: moveId}, 
            {status: moveCloset}, 
            function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("updated status");
                }
        }); 

        res.redirect("/closet");
    } else if (movePhotod == "photod") {
        Item.findOneAndUpdate(
            {_id: moveId}, 
            {status: movePhotod}, 
            function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("updated status");
                }
        }); 

        res.redirect("/photod");
    } else if (moveListed == "listed") {
        Item.findOneAndUpdate(
            {_id: moveId}, 
            {status: moveListed}, 
            function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("updated status");
                }
        }); 

        res.redirect("/listed");
    } else {
        Item.findByIdAndRemove(moveId, function(err) {
            if (err) {
                console.log(err);
            }   else {
                console.log("Removed Item By Id");
            }
        });

        res.redirect("/");
    } 
});

app.listen(3000, function() {
    console.log("Server running on port 3000");
});

// require('dotenv').config();
// const ejs = require("ejs");
// const session = require("express-session"); 
// const passport = require("passport");
// const passportLocalMongoose = require ("passport-local-mongoose");
// const FacebookStrategy = require("passport-facebook").Strategy;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const findOrCreate = require("mongoose-findorcreate");

// // const md5 = require("md5");
// // const bcrypt = require("bcrypt");
// // const saltRounds = 10;

// const app = express();

// app.use(express.static("public"));
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({extended: true}));

// app.use(session({
//     secret: "Our little secret.",
//     resave: false,
//     saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.set("useCreateIndex", true);

// const userSchema = new mongoose.Schema({
//     email: String,
//     password: String,
//     socialId: String,
//     secret: String
// });

// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

// const User = new mongoose.model("User", userSchema);

// passport.use(User.createStrategy());

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//         done(err, user);
//     });
// });

// passport.use(new FacebookStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/secrets"
// },
// function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({socialId: profile.id}, function(err, user) {
//         if (err) {
//             return done(err);
//         }

//         done(null, user);
//     });
// }
// ));

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/secrets"
// },
// function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({socialId: profile.id}, function(err, user) {
//         return cb(err, user);
//     });
// }));