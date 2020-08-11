require('dotenv').config();
const _ = require('lodash');
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
// const usps = require('usps-web-tools-node-sdk');
// usps.configure({ userID: '349RUNAN2685' });

let callbackURL = "http://localhost:3000/auth/"
let port = process.env.PORT;

if (port == null || port == "") {
    port = 3000;
} else {
    callbackURL = "https://secret-sea-49678.herokuapp.com/auth/"
}

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

mongoose.connect(`mongodb+srv://runandJUMP:${process.env.PASSWORD}@depoppler-xznul.mongodb.net/dePoppler?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => console.log("Connected"))
    .catch(err => console.log("Caught", err.stack));
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    socialId: String,
    items: [{
        group: String,
        img: String,
        name: String,
        price: Number,
        cost: Number,
        status: String
    }],
    lastWeeksSales: {
        sales: Number,
        salesGross: Number,
        salesNet: Number
    }
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
    callbackURL: callbackURL + "facebook/home"
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
    callbackURL: callbackURL + "google/home"
},
function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({name: profile.name.givenName, socialId: profile.id, username: profile.id}, function(err, user) {
        return cb(err, user);
    });
}));

app.get("/auth/google",
passport.authenticate("google", {scope: ["profile"]})
);

app.get("/auth/google/home",
passport.authenticate("google", {
    successRedirect: "/dashboard",
    failureRedirect: "/login"
})
);

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/dashboard", function(req, res) {
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                const count = {
                    closet: 0,
                    photod: 0,
                    listed: 0,
                    sold: 0
                };
                const totals = {
                    gross: 0,
                    net: 0
                };
                const salesByGroup = {
                    shirts: 0,
                    pants: 0,
                    shoes: 0
                }

                foundUser.items.forEach(item => {
                    if (item.status === "closet") {
                        count.closet++;
                    } else if (item.status === "photod") {
                        count.photod++;
                    } else if (item.status === "listed") {
                        count.listed++;
                    } else if (item.status === "sold") {
                        count.sold++;
                        
                        totals.gross += parseFloat(item.price.toFixed(2));
                        totals.net += parseFloat((item.price - item.cost).toFixed(2));

                        if (item.group === "Shirts") {
                            salesByGroup.shirts++;
                        } else if (item.group === "Pants") {
                            salesByGroup.pants++;
                        } else if (item.group === "Shoes") {
                            salesByGroup.shoes++;
                        }
                    }
                });

                // DUMMY DATA
                const dummyLastWeeksSales = {
                    gross: 500,
                    net: 420,
                    sales: 10
                };


                //SETTING POINTER COLOR, DIRECTION AND VALUE


                let pointerClassGross;
                let pointerColorGross;
                let percentageGross;
                let pointerClassNet;
                let pointerColorNet;
                let percentageNet;
                let pointerClassSales;
                let pointerColorSales;
                let percentageSales;


                if (totals.gross > dummyLastWeeksSales.gross) {
                    pointerClassGross = "fas fa-hand-point-up";
                    pointerColorGross = "color: #3be43b;";
                    percentageGross = "+" + (((totals.gross - dummyLastWeeksSales.gross) / dummyLastWeeksSales.gross) * 100).toFixed(2);
                } else {
                    pointerClassGross = "fas fa-hand-point-down";
                    pointerColorGross = "color: #fc6f6f;";
                    percentageGross = "-" + (((dummyLastWeeksSales.gross - totals.gross) / dummyLastWeeksSales.gross) * 100).toFixed(2);      
                }
                
                if (totals.net > dummyLastWeeksSales.net) {
                    pointerClassNet = "fas fa-hand-point-up";
                    pointerColorNet = "color: #3be43b;";
                    percentageNet = "+" + (((totals.net - dummyLastWeeksSales.net) / dummyLastWeeksSales.net) * 100).toFixed(2);
                } else {
                    pointerClassNet = "fas fa-hand-point-down";
                    pointerColorNet = "color: #fc6f6f;";
                    percentageNet = "-" + (((dummyLastWeeksSales.net - totals.net) / dummyLastWeeksSales.net) * 100).toFixed(2);      
                }
                
                if (count.sold > dummyLastWeeksSales.sales) {
                    pointerClassSales = "fas fa-hand-point-up";
                    pointerColorSales = "color: #3be43b;";
                    percentageSales = "+" + (((totals.sales - dummyLastWeeksSales.sales) / dummyLastWeeksSales.sales) * 100).toFixed(2);
                } else {
                    pointerClassSales = "fas fa-hand-point-down";
                    pointerColorSales = "color: #fc6f6f;";
                    percentageSales = "-" + (((dummyLastWeeksSales.sales - count.sold) / dummyLastWeeksSales.sales) * 100).toFixed(2);      
                }

                const styles = {
                    pointerClassGross: pointerClassGross,
                    pointerColorGross: pointerColorGross,
                    percentageGross: percentageGross,
                    pointerClassNet: pointerClassNet,
                    pointerColorNet: pointerColorNet,
                    percentageNet: percentageNet,
                    pointerClassSales: pointerClassSales,
                    pointerColorSales: pointerColorSales,
                    percentageSales: percentageSales
                };


                //SETTING GRAPH BAR HEIGHTS
                

                const mostSales = Object.keys(salesByGroup).reduce((a, b) => salesByGroup[a] > salesByGroup[b] ? a : b);
                
                salesByGroup.shirtsPercentage = Math.floor((salesByGroup.shirts / salesByGroup[mostSales]) * 100);
                salesByGroup.pantsPercentage = Math.floor((salesByGroup.pants / salesByGroup[mostSales]) * 100);
                salesByGroup.shoesPercentage = Math.floor((salesByGroup.shoes / salesByGroup[mostSales]) * 100);


                const data = [foundUser, count, totals, salesByGroup, styles];

                res.render("dashboard", {data: data});
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

app.get("/money", function(req, res) {
    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                const totals = {
                    shirts: 0,
                    pants: 0,
                    shoes: 0,
                    other: 0
                };
                const cost = {
                    shirts: 0,
                    pants: 0,
                    shoes: 0,
                    other: 0
                };
                const count = {
                    shirts: 0,
                    pants: 0,
                    shoes: 0,
                    other: 0
                };

                foundUser.items.forEach(item => {
                    if (item.status === "sold") {  
                        if (item.group === "Shirts") {
                            totals.shirts += item.price;
                            cost.shirts += item.cost;
                            count.shirts++;
                        } else if (item.group === "Pants") {
                            totals.pants += item.price;
                            cost.pants += item.cost;
                            count.pants++;
                        } else if (item.group === "Shoes") {
                            totals.shoes += item.price;
                            cost.shoes += item.cost;
                            count.shoes++;
                        } else if (item.group === "Other") {
                            totals.other += item.price;
                            cost.other += item.cost;
                            count.other++;
                        }
                    }
                });

                const nets = {
                    shirts: totals.shirts - cost.shirts,
                    pants: totals.pants - cost.pants,
                    shoes: totals.shoes - cost.shoes,
                    other: totals.other - cost.other
                };

                const averages = {
                    shirts: totals.shirts / count.shirts,
                    pants: totals.pants / count.pants,
                    shoes: totals.shoes / count.shoes,
                    other: totals.other / count.other
                };

                for (const total in totals) {
                    totals[total] = totals[total].toFixed(2);
                }
                
                for (const net in nets) {
                    nets[net] = nets[net].toFixed(2);
                }
                
                for (const average in averages) {
                    if (averages[average]) {
                        averages[average] = averages[average].toFixed(2);
                    } else {
                        averages[average] = "0.00";
                    }
                }
                const data = [totals, nets, averages];

                res.render("money", {data: data});
            }
        }
    });
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/:status", function(req, res) {
    const status = req.params.status;
    let button1;
    let button2;
    let class1;
    let class2;
    let greeting;

    if (status === "closet") {
        button1 = "photod";
        button2 = "listed";
        class1 = "fas fa-camera-retro";
        class2 = "fas fa-store";
        greeting = "Welcome to your closet."
    } else if (status === "photod") {
        button1 = "closet";
        button2 = "listed";
        class1 = "fas fa-door-closed";
        class2 = "fas fa-store";
        greeting = "These are items you have photo'd."
    } else if (status === "listed") {
        button1 = "closet";
        button2 = "photod";
        class1 = "fas fa-door-closed";
        class2 = "fas fa-camera-retro";
        greeting = "These are items you have list'd"
    } else if (status === "sold") {
        greeting = "Congrats on these sales!"
    }

    User.findById(req.user.id, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                let foundItems = foundUser.items.filter(item => {
                    return item.status == status;
                });

                foundItems = foundItems.map(item=> {
                    let name = item.name;
                    
                    if (name.length > 10) {
                        name = name.substring(0, 10) + " ...";
                    }

                    return {
                        id: item._id,
                        group: item.group,
                        name: name,
                        cost: item.cost,
                        price: item.price,
                        status: item.status
                    };
                });

                foundItems = {
                    foundItems: foundItems,
                    button1: button1,
                    button2: button2,
                    class1: class1,
                    class2: class2,
                    greeting: greeting
                }

                res.render("status", {foundItems: foundItems});
            }
        }
    });
});


// POSTS


app.post("/", function(req, res) {
    const group = _.capitalize(req.body.group);
    const newItem = req.body.item;
    const costDollars = parseInt(req.body.costDollars);
    const costCents = parseFloat(req.body.costCents) / 100;
    const cost = (costDollars + costCents).toFixed(2);
    const priceDollars = parseInt(req.body.priceDollars);
    const priceCents = parseFloat(req.body.priceCents) / 100;
    const price = (priceDollars + priceCents).toFixed(2);
        
    if (newItem) {
        const item = {
            group: group,
            name: newItem,
            cost: cost,
            price: price,
            status: "closet",
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
    const moveItem = req.body.moveItem;
    const moveId = req.body.moveId;

    if (moveItem === "delete") {
        User.findByIdAndUpdate(req.user.id, {$pull: {items: {_id: moveId}}}, function(err) {
            if (!err) {
              res.redirect("/dashboard");
            }
        });
    } else {
        User.updateOne(
            {"items._id": moveId}, 
            {"$set": {"items.$.status": moveItem}},
            function(err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                console.log("updated status-- "+ moveItem + " route");
            }
        });

        res.redirect(moveItem);
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
                res.redirect("/dashboard");
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


// LISTEN


app.listen(port, function() {
    console.log("Server started successfully");
});

// TOPS
// BOTTOMS
// OUTERWEAR
// SHOES
// ACCESSORIES
// DRESSES
// OTHER

// DEPOP SHIPPING VS USPS SHIPPING COSTS