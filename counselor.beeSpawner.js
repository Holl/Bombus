var db = require('tools.debug');

module.exports = function(spawnName, roleName, creepLevel, queenName, metaData){
	var body = getBody(roleName, creepLevel);
    var name = roleName + "_lvl" + creepLevel + "_" + Game.time.toString();
    var finalMetaData = {
        ...{'role': roleName, 'queen': queenName},
        ...metaData
    }
    var spawning = Game.spawns[spawnName].spawnCreep(body, name, {memory: finalMetaData});
    switch (spawning){
        case 0: 
            db.vLog("Spawning " + roleName);
            break;
        case ERR_NOT_ENOUGH_RESOURCES: 
            db.vLog("Not enough resources for " + roleName);
            break;
        case -10:
            db.vLog("Something wrong with trying to build " + roleName);
    }
}

function getBody(role, level){
    switch (role){
        case "starter": return getBody_Starter(level);
        case "harvester": return getBody_Harvester(level);
        case "worker": return getBody_Worker(level);
        case "carpenter": return getBody_Worker(level);
        case "upgrader": return getBody_Worker(level);
        case "scout": return getBody_Scout(level);
        case "remoteHarvester": return getBody_Harvester(level);
        case "remoteWorker": return getBody_Worker(level);
        case "reserver": return getBody_Reserver(level);
        case "collector": return getBody_Collector(level);
        case "drone": return getBody_Collector(level);
        case "captor": return getBody_Capture(level);
        case "captorBuilder": return getBody_CaptorBuilder(level);
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
        case 3: return [MOVE, WORK, WORK, WORK, WORK, WORK];
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
        case 2: return [MOVE, TOUGH];
        case 3: return [MOVE, MOVE, MOVE, TOUGH, TOUGH, TOUGH];
        case 4: return [TOUGH, TOUGH, TOUGH,TOUGH, TOUGH, TOUGH,TOUGH, TOUGH, TOUGH,TOUGH, TOUGH, TOUGH,TOUGH, TOUGH, TOUGH,TOUGH,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
}

function getBody_Reserver(level){
    switch (level){
        case 3: return [CLAIM, MOVE];
        case 4: return [CLAIM, MOVE];
    }
}

function getBody_Collector(level){
    switch (level){
        case 1: return [CARRY, MOVE]
        case 2: return [CARRY, CARRY, CARRY, CARRY, 
                        MOVE, MOVE, MOVE, MOVE];
        case 3: return [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        case 4: return [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    }
}

function getBody_Capture(level){
    switch (level){
        case 3: return [CLAIM, MOVE];
        case 4: return [CLAIM, MOVE];
    }
}

function getBody_CaptorBuilder(level){
    switch (level){
        case 3: return [
                        CARRY, CARRY, CARRY,
                        WORK, WORK, WORK,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
                        ];
        case 4: return [
                        CARRY, CARRY, CARRY,
                        WORK, WORK, WORK,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
                        ];
    }
}