const bodyParser = require("body-parser");
const express = require ("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

mongoose.connect("mongodb://localhost:27017/dePopplerDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemSchema = new mongoose.Schema({
    name: String,
    status: String,
    img: String
});

const Item = new mongoose.model("Item", itemSchema);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    items: [itemSchema]
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/closet", function(req, res) {
    Item.find({"status": "closet"}, function(err, foundItems) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("closet", {foundItems: foundItems});
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

app.get("/register", function(req, res) {
    res.render("register");
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

app.post("/register", function(req, res) {
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        items: []
    });

    user.save();

    res.redirect("/");
});

app.post("/upload", function(req, res) {
    const file = req.files.file;
    const uploadPath = __dirname + "/public/uploads/" + file.name;
    const itemSelected = req.body.itemSelected;

    file.mv(uploadPath, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("File uploaded to" + uploadPath);
        }
    });

    Item.findOneAndUpdate(
        {_id: itemSelected}, 
        {img: "../uploads/" + file.name}, 
        function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("updated img");
            }
    }); 

    console.log(itemSelected);

    res.redirect("/closet");
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

// app.get("/", function(req, res) {
//     res.render("home");
// });

// app.get("/auth/facebook",
//     passport.authenticate("facebook", {scope: ["profile"]})
// );

// app.get("/auth/facebook/secrets",
//     passport.authenticate("facebook", {failureRedirect: "/login"}),
//     function(req, res) {
//         res.redirect("/secrets");
// });

// app.get("/auth/google",
//     passport.authenticate("google", {scope: ["profile"]})
// );

// app.get("/auth/google/secrets",
//     passport.authenticate("google", {
//         successRedirect: "/secrets",
//         failureRedirect: "/login"
//     })
// );

// app.get("/login", function(req, res) {
//     res.render("login");
// });

// app.get("/logout", function(req, res) {
//     req.logout();
//     res.redirect("/");
// });

// app.get("/register", function(req, res) {
//     res.render("register");
// });

// app.get("/secrets", function(req, res) {
//     User.find({"secret": {$ne: null}}, function(err, foundUsers) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             if (foundUsers) {
//                 res.render("secrets", {usersWithSecrets: foundUsers})
//             }
//         }
//     });
// });

// app.get("/submit", function(req, res) {
//     if (req.isAuthenticated()) {
//         res.render("submit");
//     }
//     else {
//         res.redirect("/login");
//     }
// });

// app.post("/login", function(req, res) {
//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     });

//     req.login(user, function(err) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             passport.authenticate("local")(req, res, function() {
//                 res.redirect("/secrets");
//             });
//         }
//     });
// });

// app.post("/register", function(req, res) {
    
//     User.register({username: req.body.username}, req.body.password, function(err, user) {
//         if (err) {
//             console.log(err);
//             res.redirect("/register");
//         }
//         else {
//             passport.authenticate("local")(req, res, function() {
//                 res.redirect("/secrets");
//             });
//         }
//     });
// });

// app.post("/submit", function(req, res) {
//     const submittedSecret = req.body.secret

//     User.findById(req.user.id, function(err, foundUser) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             if (foundUser) {
//                 foundUser.secret = submittedSecret;
//                 foundUser.save(function() {
//                     res.redirect("/secrets");
//                 });
//             }
//         }
//     });
// });

// app.listen(3000, function() {
//     console.log("Server running on port 3000");
// });