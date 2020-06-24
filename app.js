require('dotenv').config();
const bodyParser = require("body-parser");
const express = require ("express");
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const fileUpload = require("express-fileupload");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require ("passport-local-mongoose");
const session = require("express-session"); 

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://runandJUMP:${process.env.PASSWORD}@depoppler-xznul.mongodb.net/dePoppler?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    socialId: String,
    items: [{
        name: String,
        status: String,
        img: String,
        price: String
    }]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/home"
},
function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({socialId: profile.id}, function(err, user) {
        if (err) {
            return done(err);
        }

        done(null, user);
    });
}
));

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/home"
},
function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({socialId: profile.id, username: profile.id}, function(err, user) {
        return cb(err, user);
    });
}));

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/auth/google",
    passport.authenticate("google", {scope: ["profile"]})
);

app.get("/auth/google/home",
    passport.authenticate("google", {
        successRedirect: "/welcome",
        failureRedirect: "/login"
    })
);

app.get("/closet", function(req, res) {
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                const foundItems = foundUser.items;

                res.render("closet", {foundItems: foundItems});
            }
        }
    });
});


app.get("/listed", function(req, res) {
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                const foundItems = foundUser.items;
                
                res.render("listed", {foundItems: foundItems});
            }
        }
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});

app.get("/newuser", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("newuser");
    } else {
        res.redirect("/register");
    }    
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/photod", function(req, res) {
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                const foundItems = foundUser.items;

                res.render("photod", {foundItems: foundItems});
            }
        }
    });
});

app.get("/welcome", function(req, res) {
    res.render("welcome");
});

app.post("/", function(req, res) {
    const newItem = req.body.item;
    const price = req.body.price;
    
    if (newItem) {
        const item = {
            name: newItem,
            price: price,
            status: "closet"
        };
        
        User.findById(req.user.id, function(err, foundUser) {
            if (err) {
                console.log(err);
            }
            else {
                if (foundUser) {
                    foundUser.items.push(item);
                    foundUser.save(() => {
                        res.redirect("/closet");
                    });
                }
            }
        });

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
        User.updateOne(
            {"items._id": moveId}, 
            {"$set": {"items.$.status": "closet"}},
            function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                console.log("updated status--closet route");
            }
        });

        res.redirect("/closet");
    } else if (movePhotod == "photod") {
        User.updateOne(
            {"items._id": moveId}, 
            {"$set": {"items.$.status": "photod"}},
            function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                console.log("updated status--photod route");
            }
        });

        res.redirect("/photod");
    } else if (moveListed == "listed") {
        User.updateOne(
            {"items._id": moveId}, 
            {"$set": {"items.$.status": "listed"}},
            function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                console.log("updated status--lised route");
            }
        });

        res.redirect("/listed");
    } else {
        User.findByIdAndUpdate(req.user.id, {$pull: {items: {_id: moveId}}}, function(err) {
            if (!err) {
              res.redirect("/closet");
            }
        });
    } 
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
            res.redirect("/login");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/welcome");
            });
        }
    });
});

app.post("/register", function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/newuser");
            });
        }
    });
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

    User.updateOne(
        {_id: req.user.id,
        "items._id": itemSelected}, 
        {$set: {"items.$.img": "../uploads/" + file.name}}, 
        function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("updated img");
            }
    }); 

    res.redirect("/closet");
});


app.listen(3000, function() {
    console.log("Server running on port 3000");
});