module.exports = function(spawnName, roleName, creepLevel, queenName, metaData){
	var body = getBody(roleName, creepLevel);
    var name = roleName + "_lvl" + creepLevel + "_" + Game.time.toString();
    var finalMetaData = {
        ...{'role': roleName, 'queen': queenName},
        ...metaData
    }
    Game.spawns[spawnName].spawnCreep(body, name, { memory: finalMetaData});
}

function getBody(role, level){
    switch (role){
        case "starter": return getBody_Starter(level);
        case "harvester": return getBody_Harvester(level);
    }
}

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
