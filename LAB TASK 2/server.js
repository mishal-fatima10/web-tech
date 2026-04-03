const express = require("express");
const app = express();
const path = require("path");

// EJS setup
app.set("view engine", "ejs");

// Static files (CSS, JS, Images) serve karne ke liye
app.use(express.static("public"));

// Routes
app.get("/", function (req, res) {
    res.render("homepage");
});

app.get("/contact-us", function (req, res) {
    res.render("contact-us");
});

app.get("/shop-by", function (req, res) {
    res.render("shop-by");
});

app.get("/unstitched-lawn", function (req, res) {
    res.render("unstitched-lawn");
});

app.get("/luxe-pret", function (req, res) {
    res.render("luxe-pret");
});

app.get("/semi-formals", function (req, res) {
    res.render("semi-formals");
});

app.get("/formals", function (req, res) {
    res.render("formals");
});

app.get("/bridals", function (req, res) {
    res.render("bridals");
});

app.get("/menswear", function (req, res) {
    res.render("menswear");
});

// Server Start
const PORT = 3000;
app.listen(PORT, function () {
    console.log(`Server started at http://localhost:${PORT}`);
});