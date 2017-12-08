var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var request = require("request");
var multer = require("multer");

// upload MULTER
var upload = multer({
  dest: "./uploads/"
});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//// CONNECTION DB MLAB
var mongoose = require("mongoose");
var options = { server: { socketOptions: { connectTimeoutMS: 30000 } } };

mongoose.connect(
  "mongodb://pighqs:rentcar@ds129906.mlab.com:29906/rentcar",
  options,
  function(err) {
    if (err) {
      console.log("erreur : " + err);
    } else {
      console.log("rentcar DB MLAB connect");
    }
  }
);

// schemas
var carSchema = mongoose.Schema({
  model: String,
  brand: String,
  city: String,
  lat: Number,
  lng: Number,
  seats: Number
});

// models
var CarModel = mongoose.model("cars", carSchema);

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/savecar", upload.array(), function(req, res) {
  console.log(req.body);
  var city = req.body.city;
  var keyGoogle = "AIzaSyDH5y_hZ25iSR87OMKrt9TFLH1IuO1ULrE";
  var geocodeURL =
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
    city +
    "&key=" +
    keyGoogle;

  request(geocodeURL, function(error, response, body) {
    var cityDatasFromGeocodeAPI = JSON.parse(body);
    var latitude = cityDatasFromGeocodeAPI.results[0].geometry.location.lat;
    var longitude = cityDatasFromGeocodeAPI.results[0].geometry.location.lng;

    var newCar = new CarModel({
      model: req.body.model,
      brand: req.body.brand,
      city: req.body.city,
      lat: latitude,
      lng: longitude,
      seats: req.body.seats
    });

    // on insere dans la base de donnees
    newCar.save(function(error, car) {
      if (error) {
        console.log(error);
      } else {
        console.log("save DB ok" + car);
      }
      //on redirige sur la home
      res.redirect("/");
    });
  });
});

app.get("/findcars", function(req, res) {
  CarModel.find(function(error, cars) {
    console.log(cars);
  });
  res.send(cars);
});

var port = process.env["PORT"] || 8080;

app.listen(port, function() {
  console.log("Server listening on port 8080");
});
