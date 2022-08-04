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
    }
}

function getBody_Starter(level){
    switch (level){
        case 1: return [MOVE, 
                        WORK, CARRY];
    }
}

