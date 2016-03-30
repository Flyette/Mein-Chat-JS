var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
var fs = require('fs');
var users = {};
app.use(express.static(__dirname + '/public'));


io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
        users[pseudo] = {name: pseudo, id: socket.id};
        //envoi à soi-meme
        socket.emit('connected', users);
        //envoi aux autres sauf à soi-meme
        socket.broadcast.emit('connected', users);



    });
    socket.on('disconnect', function(){
        for (var user in users) {
            if (users[user].id == socket.id) {
                delete users[user];
            }
        }
        socket.broadcast.emit('connected', users);
    })

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        var myDate = new Date();
        var dateString = myDate.toLocaleDateString() + " " + myDate.toLocaleTimeString();
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message, dateString: dateString});
    }); 


});



server.listen(8000);