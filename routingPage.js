const MongoClient = require('mongodb').MongoClient;
const url_S = "mongodb+srv://sophiayang:123qweasd@cluster0.c2ncf.mongodb.net/plarent?retryWrites=true&w=majority"; 
const url_L = "mongodb+srv://luckonar:Luckonar123@cluster0.7agxc.mongodb.net/Plarent?retryWrites=true&w=majority"; 
var http = require('http');
var fs = require('fs');
var qs = require('querystring');

var port = process.env.PORT || 3001;

http.createServer(function (req, res) {
    if (req.url == "/")
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
        res.write("here");
        
        // // when complete POST data is received
        // req.on('end', () => {
        // 	pdata = qs.parse(pdata);
        //     console.log(pdata);
        
        //     MongoClient.connect(url_S, { useUnifiedTopology: true }, function(err, db) {
        //         if(err) { console.log("Connection err: " + err); return; }
        
        //         var dbo = db.db("plarent");
        //     	var coll = dbo.collection('pins');
                
        //         coll.insertOne(pdata, function(err, res) {
        //             if (err) { console.log("query err: " + err); return; }
        //             console.log("new document inserted");
        //         })
        //     	console.log("Success!");
                
        //         file = 'map.html';
        //         fs.readFile(file, function(err, txt) {
        //             res.writeHead(200, {'Content-Type': 'text/html'});
        //             res.write(txt);
        //             
        //         });
        //     });  //end connect
        // });
        res.end();
    }
    // else if(req.url == "/plantdata.html") 
    // {
    //     file="plantdata.html";
    //     fs.readFile(file, function(err, txt) {
    //       res.writeHead(200, {'Content-Type': 'text/html'});
    //       res.write(txt);
    //       res.end();
    //     });
      
    //} 
    // else if(req.url == "/plantdata.html/search") 
    // {
    //     file="plantdata.html";
    //     fs.readFile(file, function(err, txt) {
    //       res.writeHead(200, {'Content-Type': 'text/html'});
    //       res.write(txt);
    //     });
    //     var body = '';
    //     req.on('data', data => {
    //       body += data.toString();
    //       console.log('on data');
    //     });
        
    //     req.on('end', () => {
    //       console.log('on end');
    //       post = qs.parse(body);
          
    //       MongoClient.connect(url_L, { useUnifiedTopology: true }, function(err, db) {
    //         if(err) { return console.log(err); }
            
    //         var dbo = db.db("Plarent");
    //         var collection = dbo.collection('Plarent');
            
    //         theQuery = "";
    //         theQuery = {Name:post['query']};
    //         console.log(theQuery);
            
    //         collection.find(theQuery).toArray(function(err, items) {
    //           if (err) { console.log(err); }
    //           else {
    //             res.write("<br /><br /> <h2>Search Results: </h2><br />");
    //             if (items.length == 0) {
    //               res.write("None found. Try a different spelling?");
    //             } else {
    //               for (i=0; i<items.length; i++) {
    //                 res.write("<strong>"+items[i].Name+"</strong> "+"<br />");
    //                 res.write("Watering: "+items[i].Water_Frequency);
    //                 res.write("<br />Sunlight: "+items[i].Sunlight);
    //                 res.write("<br />Difficulty: "+items[i].Difficulty);
    //                 res.write("<br />Comments: "+items[i].Comments+"<br /><br />");
    //               }
    //             }
    //           }
    //         });
            
    //         setTimeout(function(){db.close();console.log("success!");},1000);
    //       });
    //       setTimeout(function(){res.end();console.log("success!");},5000);
    //     });
    //   } 
    //   else if (req.url == "/plantdata.html/insert") 
    //   {
    //     file="plantdata.html";
    //     fs.readFile(file, function(err, txt) {
    //       res.writeHead(200, {'Content-Type': 'text/html'});
    //       res.write(txt);
    //     });
    //     var body = '';
    //     req.on('data', data => {
    //       body += data.toString();
    //       console.log('on data');
    //     });
        
    //     req.on('end', () => {
    //       console.log('on end');
    //       post = qs.parse(body);
          
    //       MongoClient.connect(url_L, { useUnifiedTopology: true }, function(err, db) {
    //         if(err) { return console.log(err); }
            
    //         var dbo = db.db("Plarent");
    //         var collection = dbo.collection('Plarent');
            
    //         var theQuery = {"Name": post["name"], "Water_Frequency": post["water"],
    //                     "Sunlight": post["sunlight"], "Difficulty": post["diff"], 
    //                     "Comments": post["comments"]};
            
    //         collection.insertOne(theQuery, function(err, res) {
    //           if(err) { console.log("query err: " + err); return; }
    //         }   );
    //         res.write("<br /><br /> <h2>Thank you for submitting!</h2><br />");
            
    //         setTimeout(function(){db.close();console.log("success!");},1000);
    //       });
    //       setTimeout(function(){res.end();console.log("success!");},5000);
    //     });
    // }
    else 
    {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.write ("Unknown page request");
        res.end();
    }
}).listen(port);