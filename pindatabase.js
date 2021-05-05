const MongoClient = require('mongodb').MongoClient;
const url_S = "mongodb+srv://sophiayang:123qweasd@cluster0.c2ncf.mongodb.net/plarent?retryWrites=true&w=majority"; 
const url_L = "mongodb+srv://luckonar:Luckonar123@cluster0.7agxc.mongodb.net/Plarent?retryWrites=true&w=majority"; 
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var NodeGeocoder = require('node-geocoder');

var port = process.env.PORT || 3000;
// var port = 8080; //localhost

http.createServer(function (req, res) {
    if (req.url == "/index.html" || req.url == "/")
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

            /* Displaying website header */
            header_s = "";
            header_s += "<a href='index.html' class='logoLink'><img src='https://photos.smugmug.com/Plarent/n-8RTWkq/i-NNBZ2WP/0/b59e3896/M/i-NNBZ2WP-M.png' class='logo'/></a>";
            header_s += "<div id='myNav' class='overlay'>";
            header_s +=     "<a href='javascript:void(0)' class='closebtn' onclick='closeNav()'>&times;</a>";
            header_s += 	"<div class='overlay-content'>";
            header_s += 		"<a href='index.html'>Home</a>";
            header_s += 		"<a href='plantdata.html'>Search for Care Information</a>";
            header_s += 		"<a href='map.html'>Resource Map</a>";
            header_s += 		"<a href='contact.html'>Contact</a>";
            header_s += 	"</div>";
            header_s += "</div>";
            header_s += "<span style='font-size:50px;cursor:pointer' onclick='openNav()'>&#9776</span>";
            header_s += "<h1 style='text-align: center'>Search for Nearby Resources!</h1><br><br><br>";
            header_s += "<div id='map'></div>";
            res.write(header_s);

            //Object for pins
        	function Pin(type, latitude, longitude, store, item, price, notes, address)
        	{
        		this.type = type;
        		this.latitude = latitude;
        		this.longitude = longitude;
        		this.store = store;
        		this.item = item;
        		this.price = price;
        		this.notes = notes;
                this.address = address;
        	}

        	var pins = [];  // Create an array of pin objects from database
            /* Connect to Mongo */
            MongoClient.connect(url_S, { useUnifiedTopology: true }, function(err, db) {
                if(err) { console.log("Connection err: " + err); return; }

                var dbo = db.db("plarent");
            	var coll = dbo.collection('pins');

                console.log("before find");
                var s = coll.find().stream();
                s.on("data", function(item) {
                    if (item.type == "PlantPurchase") { 
                        var supplyItem = item.plantType;
                    } else {
                        var supplyItem = item.supplyItem;
                    }
                    var type = item.type;
                    var store = item.store;
                    var price = item.price;
                    var notes = item.notes;
                    var wildDescrip = item.wildDescrip;
                    var address = item.streetNum + " " + item.street + ", " + item.city + ", " + item.state + ", " + item.country;
                    var latitude = item.latitude;
                    var longitude = item.longitude;

                    if (wildDescrip != "") notes = wildDescrip;
                    var newpin = new Pin(type, latitude, longitude, store, supplyItem, price, notes, address);
                    pins.push(newpin);
                });
                s.on("end", function() {
                    // console.log("pin array", pins);
                    var pinarray_string = JSON.stringify(pins);

                    /* Displaying Google map */
                    res.write("<script>pins =" + pinarray_string + "</script>");
                    map_s = "";
                    map_s += "<script>";
                    //Creates the map centered at Boston unless user allows location
                    map_s += "let map;";
                    map_s += "const boston1 = { lat: 42.3602534, lng: -71.0582912 };";
                    map_s += "function initMap() {";
                    map_s +=    "map = new google.maps.Map(document.getElementById('map'), {";
                    map_s +=        "center: boston1,";
                    map_s +=        "zoom: 12,";
                    map_s +=    "});";
                    
                    //Recenter map if user allows location
                    map_s +=    "if (navigator.geolocation) {";
                    map_s +=        "navigator.geolocation.getCurrentPosition(";
                    map_s +=            "(position) => {";
                    map_s +=                "pos = {";
                    map_s +=                    "lat: position.coords.latitude,";
                    map_s +=                    "lng: position.coords.longitude,";
                    map_s +=                "};";
                    map_s +=                "map.setCenter(pos);";
                    map_s +=            "},";
                    map_s +=            "() => {";
                    map_s +=                "handleLocationError(true, infoWindow, map.getCenter());";
                    map_s +=            "}";
                    map_s +=        ");";
                    map_s +=    "} else {";
                                    // Browser doesn't support Geolocation
                    map_s +=        "handleLocationError(false, infoWindow, map.getCenter());";
                    map_s +=    "}";
                    
                    //Creates a marker and an info-window for each marker
                    map_s +=    "for (var i=0; i < pins.length; i++) {";
                                    //Makes location 
                    map_s +=    	"const location = {lat : pins[i].latitude, lng: pins[i].longitude};";
                                    //Makes icon type 
                    map_s +=        "var icontype;"
                    map_s +=		"if (pins[i].type == 'SuppliesPurchase'){"
                    map_s +=			"icontype = 'http://maps.google.com/mapfiles/kml/shapes/shopping.png';"
                    map_s +=		"}"
                    map_s +=		"else if (pins[i].type == 'PlantPurchase'){"
                    map_s +=			"icontype = 'http://maps.google.com/mapfiles/kml/shapes/sunny.png';"
                    map_s +=		"}"
                    map_s +=		"else if (pins[i].type == 'WildPlant'){"
                    map_s +=			"icontype = 'http://maps.google.com/mapfiles/kml/shapes/parks.png';"
                    map_s +=		"}"
                                    //Puts marker on map
                    map_s +=    	"const marker = new google.maps.Marker({";
                    map_s +=    		"position: location,";
                    map_s +=    		"map: map,";
                    map_s +=            "icon: icontype";
                    map_s +=    	"});";
                                    //Makes info window
                    map_s +=	    "if (pins[i].notes == undefined){pins[i].notes = 'No notes here!';}";      
                    map_s +=	    "var contentString = '';";
                    map_s +=	    "if (pins[i].type == 'PlantPurchase' || pins[i].type == 'SuppliesPurchase') {";
                    map_s +=		    "contentString =";
                    map_s +=	        "'<div class=\"content\">' +";
                    map_s +=		        "'<h2 id=\"firstHeading\" class=\"firstHeading\"> Store: ' + pins[i].store + '</h2>' +";
                    map_s +=		        "'<div id=\"bodyContent\">' +";
                    map_s +=		        "'<p> Item Purchased: ' + pins[i].item + '</p>' +";
                    map_s +=		        "'<p> Price: ' + pins[i].price + '</p>' +";
                    map_s +=		        "'<p> Notes: ' + pins[i].notes + '</p>'+";
                    map_s +=                "'<p>' + pins[i].address + '</p>' +";
                    map_s +=	            "'</div>' +";
                    map_s +=	        "'</div>';";
                    map_s +=	    "}";
                    map_s +=	    "if (pins[i].type == 'WildPlant') {";
                    map_s +=		    "contentString =";
                    map_s +=	        "'<div class=\"content\">' +";
                    map_s +=		        "'<h2 id=\"firstHeading\" class=\"firstHeading\">' + 'Wild Plant Found!' + '</h2>' +";
                    map_s +=		        "'<div id=\"bodyContent\">' +";
                    map_s +=		        "'<p> Description: ' + pins[i].notes + '</p>'+";
                    map_s +=                "'<p>' + pins[i].address + '</p>' +";
                    map_s +=	            "'</div>' +";
                    map_s +=	        "'</div>';";
                    map_s +=	    "}";
                    map_s +=        "const infowindow = new google.maps.InfoWindow({";
                    map_s +=            "content: contentString,";
                    map_s +=        "});";
                    map_s +=	        "marker.addListener('click', () => {";
                    map_s +=            "infowindow.open(map, marker);";
                    map_s +=        "});";
                    map_s +=    "}";
                    map_s += "}";
                    map_s += "</script>";
                    res.write(map_s);
                    res.write("<script src='https://maps.googleapis.com/maps/api/js?key=AIzaSyDbHeyWVPYGmWmoF4uv2E5tVaMQeCZ86cA&callback=initMap&libraries=&v=weekly' async></script>");
                    /* Displaying rest of HTML page below map*/
                    res.write(txt);

                    console.log("end of data"); 
                    db.close();
                    res.end();
                });
                console.log("after close");
            });  //end connect
        });
    }
    else if (req.url == "/process")
    {
        res.writeHead(200, {'Content-Type': 'text/html'});
        pdata = "";
        req.on('data', data => {
            pdata += data.toString();
        });
        // when complete POST data is received
        req.on('end', () => {
        	pdata = qs.parse(pdata);
            address = pdata["streetNum"] + pdata["street"] + pdata["city"] + pdata["state"];

            /* Use Node Geocoder module to get lat and long from address */
            const options = {
                provider: 'google',
                apiKey: 'AIzaSyDbHeyWVPYGmWmoF4uv2E5tVaMQeCZ86cA',
            };
            const geocoder = NodeGeocoder(options);
            geocoder.geocode(address)
               .then((response)=> {
                   MongoClient.connect(url_S, { useUnifiedTopology: true }, function(err, db) {
                       if(err) { console.log("Connection err: " + err); return; }

                       var dbo = db.db("plarent");
                   	   var coll = dbo.collection('pins');

                       pdata["latitude"] = response[0].latitude;
                       pdata["longitude"] = response[0].longitude;
                       
                       coll.insertOne(pdata, function(err, res) {
                           if (err) { console.log("query err: " + err); return; }
                           console.log("new document inserted");
                       })
                   	   console.log("Success!");

                       file = 'redirect.html';
                       fs.readFile(file, function(err, txt) {
                           res.writeHead(200, {'Content-Type': 'text/html'});
                           res.write(txt);
                           res.end();
                       });
                   });  //end connect
               })
               .catch((err)=> {
                   console.log(err);
               });
        });
    }
    else if(req.url == "/plantdata.html") {
        file="plantdata.html";
        fs.readFile(file, function(err, txt) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(txt);
          res.end();
        });

      } 
      else if(req.url == "/search") 
      {
        file="plantdata.html";
        fs.readFile(file, function(err, txt) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(txt);
        });
        var body = '';
        req.on('data', data => {
          body += data.toString();
          console.log('on data');
        });

        req.on('end', () => {
          console.log('on end');
          post = qs.parse(body);

          MongoClient.connect(url_L, { useUnifiedTopology: true }, function(err, db) {
            if(err) { return console.log(err); }

            var dbo = db.db("Plarent");
            var collection = dbo.collection('Plarent');

            theQuery = "";
            theQuery = {Name:post['query']};
            console.log(theQuery);

            collection.find(theQuery).toArray(function(err, items) {
              if (err) { console.log(err); }
              else {
                res.write("<br /><br /> <h2>Search Results: </h2><br />");
                if (items.length == 0) {
                  res.write("None found. Try a different spelling?");
                } else {
                  for (i=0; i<items.length; i++) {
                    res.write("<strong>"+items[i].Name+"</strong> "+"<br />");
                    res.write("Watering: "+items[i].Water_Frequency);
                    res.write("<br />Sunlight: "+items[i].Sunlight);
                    res.write("<br />Difficulty: "+items[i].Difficulty);
                    res.write("<br />Comments: "+items[i].Comments+"<br /><br />");
                  }
                }
              }
            });

            setTimeout(function(){db.close();console.log("success!");},1000);
          });
          setTimeout(function(){res.end();console.log("success!");},5000);
        });
      } 
      else if (req.url == "/insert") 
      {
        file="plantdata.html";
        fs.readFile(file, function(err, txt) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(txt);
        });
        var body = '';
        req.on('data', data => {
          body += data.toString();
          console.log('on data');
        });

        req.on('end', () => {
          console.log('on end');
          post = qs.parse(body);

          MongoClient.connect(url_L, { useUnifiedTopology: true }, function(err, db) {
            if(err) { return console.log(err); }

            var dbo = db.db("Plarent");
            var collection = dbo.collection('Plarent');

            var theQuery = {"Name": post["name"], "Water_Frequency": post["water"],
                        "Sunlight": post["sunlight"], "Difficulty": post["diff"], 
                        "Comments": post["comments"]};

            collection.insertOne(theQuery, function(err, res) {
              if(err) { console.log("query err: " + err); return; }
            }   );
            res.write("<br /><br /> <h2>Thank you for submitting!</h2><br />");

            setTimeout(function(){db.close();console.log("success!");},1000);
          });
          setTimeout(function(){res.end();console.log("success!");},5000);
        });
    } else if (req.url == "/contact.html") {
        file="contact.html";
        fs.readFile(file, function(err, txt) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(txt);
          res.end();
        });
    }
    else 
    {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write ("Unknown page request");
        res.end();
    }
}).listen(port);