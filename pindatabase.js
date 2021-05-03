const MongoClient = require('mongodb').MongoClient;
const url_S = "mongodb+srv://sophiayang:123qweasd@cluster0.c2ncf.mongodb.net/plarent?retryWrites=true&w=majority"; 
const url_L = "mongodb+srv://luckonar:Luckonar123@cluster0.7agxc.mongodb.net/Plarent?retryWrites=true&w=majority"; 
var http = require('http');
var fs = require('fs');
var qs = require('querystring');

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
            
            /* Displaying website header */
            header_s = "";
            header_s += "<a href='index.html' class='logoLink'><img src='Logo.png' class='logo'/></a>";
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
   
            /* Displaying Google map */
            map_s = "";
            map_s += "<script>";
            map_s += "let map;";
            map_s += "const boston1 = { lat: 42.3602534, lng: -71.0582912 };";
            map_s += "function initMap() {";
            map_s +=    "map = new google.maps.Map(document.getElementById('map'), {";
            map_s +=        "center: boston1,";
            map_s +=        "zoom: 12,";
            map_s +=    "});";
            map_s +=    "const marker = new google.maps.Marker({";
            map_s +=        "position: boston1,";
            map_s +=        "map: map,";
            map_s +=    "});";
            map_s += "}";
            map_s += "</script>";
            res.write(map_s);
            res.write("<script src='https://maps.googleapis.com/maps/api/js?key=AIzaSyDbHeyWVPYGmWmoF4uv2E5tVaMQeCZ86cA&callback=initMap&libraries=&v=weekly' async></script>");
                    
            /* Connect to Mongo */
            MongoClient.connect(url_S, { useUnifiedTopology: true }, function(err, db) {
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

            	// Create an array of pin objects from database
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
            
            /* Displaying rest of HTML page below map*/
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
    else if(req.url == "/plantdata.html") {
        file="plantdata.html";
        fs.readFile(file, function(err, txt) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(txt);
          res.end();
        });
      
      } 
      else if(req.url == "/plantdata.html/search") 
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
          
          MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
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
      else if (req.url == "/plantdata.html/insert") 
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
          
          MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
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
    }
    else 
    {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write ("Unknown page request");
        res.end();
    }
}).listen(port);