var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
var port = 3000;
var connectedUsers = {};

//var redis = require('redis');
//var redisClient = redis.createClient();

// listening to port...
server.listen(port);

//Configure the main routes
app.use("/css", express.static(__dirname + '/public/css'));
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/img", express.static(__dirname + '/public/img'));

// serving the main applicaion file (index.html)
// when a client makes a request to the app root
// (http://localhost:8080/)
app.get('/',function(request, response) {
	response.sendfile(__dirname+"/public/index.html");
});

// sets the log level of socket.io, with
// log level 2 we wont see all the heartbits
// of each socket but only the handshakes and
// disconnections
io.set('log level', 2);

// setting the transports by order, if some client
// is not supporting 'websockets' then the server will
// revert to 'xhr-polling' (like Comet/Long polling).
// for more configurations go to:
// https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
io.set('transports', [ 'websocket', 'xhr-polling' ]);



io.sockets.on('connection', function(client) {
  //console.log('Client connected...');
  //client.emit('messagesFromServer', {hello:'world'});

  client.on('join', function(usuario){
    console.log(usuario.name + " connected" );
    //user.name = usuario.name;
    client.set("nickname", usuario.name);
    connectedUsers[usuario.name] = usuario;
    client.broadcast.emit("newUserConnected", usuario);
  });

  client.on('messages', function(msg){
    console.log(msg);
    client.get('nickname', function(err, name){
      var user = connectedUsers[name];
      if(user){
        var data = {
          sender: user.name,
          message: msg
        };
        client.broadcast.emit("new chat msg", data);//{"name":name, "message":msg});
      }
    });
  });

  
  client.on('mapLocation', function(info){
    var user = connectedUsers[info.name];
    if (user) {
      user.lat = info.latitud;
      user.lon = info.longitud;
      console.log("The map location info is: "+ user.lat + " " + user.lon + " " + info.name);
      client.broadcast.emit("location update", info);
    }
  });
  

  /*
  redisClient.lrange("questions", 0, -1, function(err, questions) {
    questions.forEach(function(question) {
      client.emit("question", question);
    });
  })

  client.on('answer', function(question, answer) {
    client.broadcast.emit('answer', question, answer);
  });

  client.on('question', function(question) {
    client.get('question_asked', function(asked) {
      if(!asked) {
        client.set('question_asked', true);
        client.broadcast.emit('question', question);
        
        redisClient.lpush("questions", question, function(err, response){
          redisClient.ltrim("questions", 0, 20);
        });
      }
    });
  });*/
});
