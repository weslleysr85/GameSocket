import express from "express";
import http from "http";
import createGame from './public/game.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const sockets = new Server(server);
var ping = Date.now();

function pingNow(){
    var pingNow = Date.now() - ping;
    ping = Date.now();
    return pingNow;
}

app.use(express.static('public'));

const game = createGame();
game.start();

game.subscribe((command) => {    
    console.log(`Emitting ${command.type}`,pingNow());
    sockets.emit(command.type, command);
});



console.log(game.state); //{ size: 40, players: {}, fruits: {} }

sockets.on('connection', (socket)=>
{
    const playerId = socket.id;
    console.log(`> Player connected on Server with id: ${playerId}`);
    game.addPlayer({id:playerId});
    socket.emit('setup', game.state)

    socket.on('disconnect', (socket)=>
    {
        game.removePlayer({id:playerId});
    });

    socket.on('move-player', (command)=>
    {
        command.playerId = playerId;
        command.type = 'move-player';
        game.movePlayer(command);
    });
});


server.listen(3000, ()=>
{
    console.log(`> Server listening on 3000`);
});