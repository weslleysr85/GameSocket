import UUID from "./uuid.js"


function createGame () 
{
    const acceptedMoves = {
        w(player) 
        {
            if(player.y > 0){ 
                player.y--;               
            }   

        },
        s(player)
        {
            if(player.y < state.size-1){
                player.y++;                
            } 
        },
        a(player)
        {
            if(player.x > 0){
                player.x--;                
            } 
        },
        d(player)
        {
            if(player.x < state.size-1){
                player.x++;                
            } 
        },          
       
    }

    const current = undefined;

    const state = {
        size:10, //quantidade horizontal e vertical de espaços para movimentar
        players: {},
        fruits: {}
    }

    const observers = [];

    function subscribe (observerFunction)
    {
        observers.push(observerFunction);
    }

    function notifyAll (command)
    {
        for(const observerFunction of observers)
        {
            observerFunction(command);
        }
    }

    function start ()
    {
        const frequency = 2000;
        setInterval(() => {addFruit({points:10})}, frequency);        
    }

    function setState (newState)
    {
        Object.assign(state, newState);
    }

    function addPlayer (command)
    {
        const { 
            id, 
            x = Math.floor(Math.random() * state.size), 
            y = Math.floor(Math.random() * state.size)                     
        } = command;

        state.players[id] = { id, x, y, points:0 };
        
        notifyAll({
            type: 'add-player',
            id, x, y
        });
    }

    function removePlayer (command)
    {
        const { id } = command;
        delete state.players[id];

        notifyAll({
            type: 'remove-player',
            id
        });
    }

    function selectPlayer (command)
    {
        const { id } = command;
        state.current = id;
    }

    function movePlayer(command) 
    {
        notifyAll(command);

        const { id, keyPressed } = command;
        const player = state.players[id];
        const moveFunction = acceptedMoves[keyPressed];
        if(moveFunction && player) 
        {
            moveFunction(player);
            checkForFuitCollision(player);
        }
    }

    function checkForFuitCollision (player)
    {
        for(const fruitId in state.fruits)
        {
            const fruit = state.fruits[fruitId];
            if(player.x === fruit.x && player.y === fruit.y) 
            {
                player.points += fruit.points;
                notifyAll({
                    type: 'player-points',
                    id:player.id, 
                    points:player.points
                });

                removeFruit({id:fruitId});
            }
        }
    }

    function addFruit (command)
    {
        const { 
            id = UUID.generate(), 
            points = 1, 
            x = Math.floor(Math.random() * state.size), 
            y = Math.floor(Math.random() * state.size)
        } = command;
        
        state.fruits[id] = { id, x, y, points };
        
        notifyAll({
            type: 'add-fruit',
            id, x, y
        });
    }

    function removeFruit (command)
    {
        const { id } = command;

        delete state.fruits[id];

        notifyAll({
            type: 'remove-fruit',
            id
        });
    }

    return {
        state,
        setState,
        subscribe,
        addPlayer,
        removePlayer,
        selectPlayer,
        movePlayer,
        addFruit,
        removeFruit,
        current,
        start
    }
}

export default createGame;