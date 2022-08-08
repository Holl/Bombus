module.exports = function(spawnName, roleName, creepLevel, queenName, metaData){
	var body = getBody(roleName, creepLevel);
    var name = roleName + "_lvl" + creepLevel + "_" + Game.time.toString();
    var finalMetaData = {
        ...{'role': roleName, 'queen': queenName},
        ...metaData
    }
    console.log(Game.spawns[spawnName].spawnCreep(body, name, {memory: finalMetaData}))
    Game.spawns[spawnName].spawnCreep(body, name, {memory: finalMetaData});
}

function getBody(role, level){
    switch (role){
        case "starter": return getBody_Starter(level);
        case "harvester": return getBody_Harvester(level);
        case "worker": return getBody_Worker(level);
        case "carpenter": return getBody_Worker(level);
        case "upgrader": return getBody_Worker(level);;
        case "scout": return getBody_Scout(level)
    }
}

// Econ Bees:

function getBody_Starter(level){
    switch (level){
        case 1: return [MOVE, 
                        WORK, CARRY];
    }
}

function getBody_Harvester(level){
    switch (level){
        case 1: return [MOVE, 
                        WORK, WORK];
        case 2: return [MOVE, 
                        WORK, WORK, WORK, WORK];
        case 3: return [MOVE, 
                        WORK, WORK, WORK, WORK, WORK];
        case 4: return [MOVE, MOVE, MOVE, MOVE, MOVE, 
                        WORK, WORK, WORK, WORK, WORK];
    }
}

function getBody_Worker(level){
    switch (level){
        case 1: return [
                        CARRY, 
                        MOVE, 
                        WORK
                        ]
        case 2: return [
                        CARRY, CARRY, CARRY,
                        WORK, WORK, 
                        MOVE, MOVE, MOVE
                        ];
        case 3: return [
                        CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK,
                        MOVE, MOVE, MOVE
                        ];
        case 4: return [
                        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        WORK, WORK, WORK, WORK, WORK,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
                        ];
    }
}


function getBody_Scout(level){
    switch (level){
        case 1: return [MOVE];
    }
}