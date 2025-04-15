var http = require('http');
var dt = require('./date'); 
var fs = require('fs');
var url = require('url');
var nodemailer = require('nodemailer');
var formidable = require('formidable');


http.createServer(function (req, res) {
  //res.writeHead(200, {'Content-Type': 'text/html'}); 
 // res.write("The date and time are currently: " + dt.myDateTime());
  //res.write(req.url);
   




  // creating the file


  //fs.appendFile('hello.txt', 'bye bye world!', function (err) {
   // fs.open('hello.txt', 'w', function (err, file) {
//     fs.writeFile('hello.txt', 'Hello content!', function (err) {
//     if (err) throw err;
//     console.log('Saved!');
//   });


  // reading the file
//   fs.readFile('hello.txt', function(err, data) {
   
//     res.write(data);
//     res.end();
//   });

  // Deleting the file
  
//   fs.unlink('hello.txt', function (err) {
//     if (err) throw err;
//     console.log('File deleted!');
//   });

// var q = url.parse(req.url, true);
//   var filename = "." + q.pathname;
//   fs.readFile(filename, function(err, data) {
//     if (err) {
//       res.writeHead(404, {'Content-Type': 'text/html'});
//       return res.end("404 Not Found");
//     } 
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(data);
//     return res.end();
// });
}).listen(8080);

var events = require('events');
var eventEmitter = new events.EventEmitter();






console.log('Server listening on port 8080'); 