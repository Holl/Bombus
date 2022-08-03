var db = require('tools.debug');

module.exports = function(){

    // Hear ye, hear ye!
    // The hearld object is what we're building over this function.
    // It's an object that basically will have all the information we'll need:
    //      1) queenObject, an object of objects of all our queens
    //      2) empireObject, anything we might look at outside this scope.
    // For now, everything is within the scope of our "queens".
    // Eventually I suspect this will be too specific, and global efforts across rooms will require 
    // an object reporting more globally.

    // We'll start with declaring these variables:

	var heraldObject = {};

    var queenObject = {};
    var empireObject = {};

	var beeArray = [];
	var queenObject = {};
	var freeBeeArray = [];
    var deadQueenBees = [];

	for(var spawn in Game.spawns){


        // This loop essentially sets up all our queens.  We're looking for all the rooms
        // which have spawns.
        
        var name = Game.spawns[spawn].room.name;

        // We're grabbing the ROOM name here as it makes the most sense for our Queen ID.
        // QueenBAI 1 used spawn name which runs into a lot of problems when we build more than 1 to a room.
        // Despite Queen=room here, a queen controls MULTIPLE rooms.
        // We just think of it as "N6W24 Queen", as an example.

		if(!queenObject.hasOwnProperty(name)) {
            // This code only runs if the name doesn't exist yet.
            // IE, if a Room has 3 spawns, we only do the queen logic once.

            // Some basic queen info we'll need about the room:
            var localLevel = Game.spawns[spawn].room.controller.level;
            var localSources =[];
            for (var i=0; i < Game.spawns[spawn].room.find(FIND_SOURCES).length;  i++){
                localSources.push(Game.spawns[spawn].room.find(FIND_SOURCES)[i].id);
            }

            var spawnObjArray = Game.spawns[spawn].room.find(FIND_MY_SPAWNS);
            var energyStructuers = Game.spawns[spawn].room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN || 
                            structure.structureType == STRUCTURE_STORAGE || 
                            structure.structureType == STRUCTURE_TOWER ||
                            structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_STORAGE);
                    }
                });
            var constructionSites = Game.spawns[spawn].room.find(FIND_CONSTRUCTION_SITES);
            var spawnNameArrray = [];
            var inactiveSpawnNameArray = [];
            for (var spawnObj in spawnObjArray){
                spawnNameArrray.push(spawnObjArray[spawnObj].name)
                if (!Game.spawns[spawnObjArray[spawnObj].name].spawning){
                    inactiveSpawnNameArray.push(spawnObjArray[spawnObj].name);
                }
            };
            var level = Game.spawns[spawn].room.controller.level;
            var levelUpBool = 0;
            if (level == 1){
                Memory[spawn] = {}; 
                Memory[spawn]['level'] = 1;
            }
            else{
                if (!Memory[spawn]){
                    Memory[spawn] = {};
                    Memory[spawn]['level'] = level;
                }
                if (Memory[spawn]['level'] != level){
                    db.vLog("Level up!");
                    Memory[spawn]['level'] = level;
                    levelUpBool = 1;
                }
            }

            var hostileCreeps = Game.spawns[spawn].room.find(FIND_HOSTILE_CREEPS);
            var hostilePower = 0;
            if (hostileCreeps){
                for (var i=0; i< hostileCreeps.length; i++){
                    hostilePower += getUnitPower(hostileCreeps[i]);
                }
            }

             var storageArray = Game.spawns[spawn].room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        structure.structureType == STRUCTURE_STORAGE);
                }
            });

            var storageBool = false;

            if (storageArray.length > 0){
                storageBool = storageArray[0].id;
            }

            // And add it to the object:
			queenObject[name] = {
                "energyNow": Game.spawns[spawn].room.energyAvailable,
                "energyMax": Game.spawns[spawn].room.energyCapacityAvailable,
                "localSources": localSources,
                "spawns": spawnNameArrray,
                "inactiveSpawns": inactiveSpawnNameArray,
                "energyStructuers": energyStructuers,
                "constructionSites": constructionSites,
                "bees":{},
                "level": level,
                "levelUpBool": levelUpBool,
                "hostilePower": hostilePower,
                "storage": storageBool
            };
		}
	};

    // We basically need to organize our bees by which queen they're loyal to.
    // They will be part of their queen's object, eventually.
    // If they don't have a queen, they're a freeBee
    // which shouldn't happen yet.

    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    for(var i in Memory.flags) {
        if(!Game.flags[i]) {
            delete Memory.flags[i];
        }
    }

	for (var creep in Game.creeps){
        var beesQueen = Game.creeps[creep].memory.queen;
        var beesRole = Game.creeps[creep].memory.role;
        
        // So if the Bee has a queen...
		if (beesQueen){
            // And if the Bee's Queen IS a Queen...
            if (queenObject[beesQueen]){
                // And if the Bee's Queen has an array called 'Bees'...
                if (queenObject[beesQueen]['bees']){
                    // And if, within the object bees, there is an array with the key of the bee's role...
                    if (queenObject[beesQueen]['bees'][beesRole]){
                        // We push our bee to a 'bees' object with role as the key.
                        queenObject[beesQueen]['bees'][beesRole].push(creep);
                    }
                    else{
                        // If the array doesn't exist yet then let's build it,
                        // Rather than pushing to it.
                        queenObject[beesQueen]['bees'][beesRole] = [creep];
                    }
                }
                else{
                    // In this case, the Bee's Queen in queenObject has no bee object, 
                    // and needs to be made.

                    // This REALLY shouldn't happen given the definition of the bees
                    // within the previous loop.
                    var beesArray = [];
                    beesArray.push(creep);
                    queenObject[beesQueen]['bees'] = beesArray;
                }
            }
            else{

                // This bee has a queen that does not exist!
                // Most likely this means the queen has been killed! 
                // The empress should rally a response to
                //          recapture or something.


                deadQueenBees.push(creep);
            }
			
		}
		else{

            // This means the Bee has no queen at all.
            // This may be the case for empire bees, but for now
            // it's just a catch all for problematic bees.

			freeBeeArray.push(creep);
		}
    };

    
    // Build and return this object so the empress and queens can take a look.

    empireObject['gcl'] = Game.gcl;
    empireObject['empireBees'] = freeBeeArray;

    heraldObject = {empireObject, queenObject};

    return heraldObject;
}

function runTerritoryScan(creep){
    // A smaller scan to understand exactly what is in a territory,
    // and and if there are any threats.
    var sources = creep.room.find(FIND_SOURCES);
    var contructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
    var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
    var roomName =  creep.room.name;
    
    return {
        "roomName": roomName,
        "sources": sources,
        "contructionSites": contructionSites,
        "hostileCreeps": hostileCreeps
    }
}

function groupBy(array, property) {
    var hash = {};
    for (var i = 0; i < array.length; i++) {
        if (!hash[array[i][property]]) hash[array[i][property]] = [];
        hash[array[i][property]].push(array[i]);
    }
    return hash;
}

function getUnitPower(creep){
    
    // Used to assess how powerful a creep is.
    // If it has no attack, it's a scout, and most likely the tower can take care of it,
    // or we just don't care.
    
 	var unitPower = 0;	
    unitPower += creep.getActiveBodyparts(ATTACK) * 80;
    unitPower += creep.getActiveBodyparts(RANGED_ATTACK) * 150;
    unitPower += creep.getActiveBodyparts(TOUGH) * 10;
    unitPower += creep.getActiveBodyparts(MOVE) * 1;
    return unitPower
}

function updateSourceMemory(creep){
    // Used to determine how many creeps are assigned to a particular
    // SOURCE, rather than the room overall.
    if (myCreeps[creep].memory.source){
        if (harvesterTargets[myCreeps[creep].memory.source] >=1){
            harvesterTargets[myCreeps[creep].memory.source]++;
        }
        else{
            harvesterTargets[myCreeps[creep].memory.source] = 1;
        }
    }
}