var connections = [];
PORT = 8080;

var //url = require('url'),
    //http = require('http'),
    io = require('socket.io'),
    exp = require('express');
    //path = require('path'),
    //fs = require('fs');

var app = exp.createServer();

var server = app.configure(function() {
    app.use(exp.staticProvider(__dirname));
});

app.listen(PORT);

var socket = io.listen(server);

socket.on('connection', function(client) {
    
    var sendCount = function(room) {
        var cnt = count(connections[room]);
        send(room, { 'type':'count', 'count':cnt });
    }

    var send = function(room ,obj) {
        for(var i in connections[room]) {
            connections[room][i].send(obj);
        }
    }

    var count = function(ary) {
        var n = 0;
        for(var i in ary) n++;
        return n;
    }

    var setClient = function(room) {
        client.room = room;
        if(connections[room] == undefined) { connections[room] = []; }
        client.number = connections[room].length;
        connections[room].push(client);
    }

    var removeClient = function() {
        delete connections[client.room][client.number];
    }

    client.on('message', function(data) {
        console.log(data);
        switch(data.type) {
            case 'init' :
                setClient(data.room);
                sendCount(data.room);
                break;

            case 'message':
                console.log('<' + client.room + '>' + data.username + ' : ' + data.message);
                send(client.room, data);
                break;

            default :break;
        }
    });

    client.on('disconnect', function() {
        removeClient();
        send(client.room, {'type':'left', 'message':client.sessionId + ' disconnected'});
        sendCount(client.room);
    });

});

console.log("http://127.0.0.1:" + PORT);
