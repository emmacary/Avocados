const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://sophiayang:123qweasd@cluster0.c2ncf.mongodb.net/plarent?retryWrites=true&w=majority";  // connection string goes here

var http = require('http');
var fs = require('fs');
var qs = require('querystring');
// var express = require('express');
// var path = require('path');
var cheerio = require('cheerio');

// var port = process.env.PORT || 3000;
var port = 8080; //localhost

http.createServer(function (req, res) {
    if (req.url == "/index.html")
    {
            file = 'index.html';
            fs.readFile(file, function(err, txt) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(txt);
                res.end();
            });
    }
    else if (req.url == "/map.html")
    {
        file = 'map.html';
        fs.readFile(file, function(err, txt) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write("<div id='map'></div>");    
            s = "";
            s += "<script>";
            s += "let map;";
            s += "const boston1 = { lat: 42.3602534, lng: -71.0582912 };";
            s += "function initMap() {";
            s += "map = new google.maps.Map(document.getElementById('map'), {";
            s += "center: boston1,";
            s += "zoom: 12,";
            s += "});";
            s += "const marker = new google.maps.Marker({";
            s += "position: boston1,";
            s += "map: map,";
            s += "});";
            s += "}";
            s += "</script>";
            res.write(s);
            
            res.write("<script src='https://maps.googleapis.com/maps/api/js?key=AIzaSyDbHeyWVPYGmWmoF4uv2E5tVaMQeCZ86cA&callback=initMap&libraries=&v=weekly' async></script>");
                    
            /* Connect to Mongo */
            MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
                if(err) { console.log("Connection err: " + err); return; }

                var dbo = db.db("plarent");
            	var coll = dbo.collection('pins');

                //Object for pins
            	function Pin(type, latitude, longitude, store, item, price, notes)
            	{
            		this.type = type;
            		this.latitude = latitude;
            		this.longitude = longitude;
            		this.store = store;
            		this.item = item;
            		this.price = price;
            		this.notes = notes;
            	}

            	//Create an array of pin objects from database
            	// This is temporary hardcoding an array for testing:
            	var pins = [];
            	var niche = new Pin("plant", 42.4085175, -71.1122302, "niche", "daisy", "$12", "great");
            	var boston = new Pin("supply", 42.3602534, -71.0582912, "btown", "city", "$300");
            	var wild = new Pin("wild", 42.395819, -71.1222902, "niche", "daisy", "$12", "red and blue");
            	pins.push(niche);
            	pins.push(boston);
            	pins.push(wild);

                console.log("before find");
                var s = coll.find().stream();
                s.on("data", function(item) {
                    var type = item.type;
                    var streetNum = item.streetNum;
                    var street = item.street;
                    var city = item.city;
                    var state = item.state;
                    var country = item.country;

            		//Make string for geocode API
            		var address = streetNum + "%" + street + "%" + city + "%" + state + "%" + country;
                    console.log(address);
                    var newpin = new Pin("plant", 42.373611, -71.110558, "niche", "sunflower", "$15", "nice!");
                    pins.push(newpin);
                    console.log(pins);
                });
                s.on("end", function() {
                    console.log("end of data"); 
                    db.close();
                });
                console.log("after close");
            });  //end connect
        
            res.write(txt);
            res.end();
        });
    }
    else if (req.url == "/map.html/process")
    {
        res.writeHead(200, {'Content-Type': 'text/html'});
        pdata = "";
        req.on('data', data => {
            pdata += data.toString();
        });

        // when complete POST data is received
        req.on('end', () => {
        	pdata = qs.parse(pdata);
            console.log(pdata);

            MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
                if(err) { console.log("Connection err: " + err); return; }

                var dbo = db.db("plarent");
            	var coll = dbo.collection('pins');

                coll.insertOne(pdata, function(err, res) {
                    if (err) { console.log("query err: " + err); return; }
                    console.log("new document inserted");
                })
            	console.log("Success!");

                file = 'map.html';
                fs.readFile(file, function(err, txt) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(txt);
                    res.end();
                });
            });  //end connect
        });
    }
    else 
    {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write ("Unknown page request");
        res.end();
    }
}).listen(port);