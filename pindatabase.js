const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://sophiayang:123qweasd@cluster0.c2ncf.mongodb.net/plarent?retryWrites=true&w=majority";  // connection string goes here

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