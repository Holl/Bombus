var noHaulers = 2;
var noCollector = 1;
var noDrones = 2;
var noUpgraders = 1;

var noHealers = 4;
var noTanks = 4;

var creepCreator = require('counselor.beeSpawner');
var db = require('tools.debug');
var common = require('tools.commonFunctions');

var runarchitect = require('counselor.architect');

var starterFunction = require('bee.starter');
var harvesterFunction = require('bee.harvester');
var workerFunction = require('bee.worker');
var carpenterFunction = require('bee.carpenter');
var upgraderFunction = require('bee.upgrader');
var scoutFunction = require('bee.scout');
var remoteHarvesterFunction = require('bee.remoteHarvester');
var remoteWorkerFunction = require('bee.remoteWorker');
var reserverFunction = require('bee.reserver');
var collectorFunction = require('bee.collector');
var droneFunction = require('bee.drone');
var captorFunction = require('bee.captor');
var captorWorkerFunction = require('bee.captorWorker')



module.exports = function(queenName){
    db.vLog("~~~~~~~~| Queen:" + queenName + " |~~~~~~~~");
    var queenObj = Memory.census.queenObject[queenName]
    db.vLog("Level "+queenObj['level']+".")
    db.vLog("Hostile power is currently " + queenObj['hostilePower'] +".");
    db.vLog("Currently "+queenObj["energyNow"]+" out of a possible "+queenObj["energyMax"]+ " energy.")
    var phase = determineQueenPhase(queenName);
    var inactiveSpawns = Memory.census.queenObject[queenName].inactiveSpawns;
    var energyMax = Memory.census.queenObject[queenName].energyMax;

    var order = Memory.census.queenObject[queenName].imperialOrder.type;
    
    if(inactiveSpawns.length > 0){

        var beeLevel = calculateLevel(energyMax, queenName);
        db.vLog("Bee level is " + beeLevel);

        var spawnCheck = false;

        spawnCheck = normalEconomySpawning(queenName, beeLevel, phase);
        if (!spawnCheck){
            spawnCheck = maintenanceSpawning(queenName, beeLevel, phase);
        }
        if (!spawnCheck && phase == "summer" && order == "expand"){
            spawnCheck = scoutSpawning(queenName, beeLevel, phase);
        }
        if (!spawnCheck && phase == "summer" && order == "capture"){
            spawnCheck = captureSpawning(queenName, beeLevel, phase);
        }
        if (!spawnCheck && phase == "summer"){
            spawnCheck  = remoteEconomySpawning(queenName, beeLevel, phase);
        }
        if (!spawnCheck){
            db.vLog("All needed bees have been spawned.")
        }
    }
    else{
        db.vLog("There are no inactive spawns.")
    }

    starterFunction(queenName, Memory.census.queenObject[queenName]);
    harvesterFunction(queenName, Memory.census.queenObject[queenName]);
    workerFunction(queenName, Memory.census.queenObject[queenName]);
    carpenterFunction(queenName, Memory.census.queenObject[queenName]);
    upgraderFunction(queenName, Memory.census.queenObject[queenName]);
    scoutFunction(queenName, Memory.census.queenObject[queenName]);
    remoteHarvesterFunction(queenName, Memory.census.queenObject[queenName]);
    remoteWorkerFunction(queenName, Memory.census.queenObject[queenName]);
    reserverFunction(queenName);
    collectorFunction(queenName, Memory.census.queenObject[queenName]);
    droneFunction(queenName, Memory.census.queenObject[queenName]);
    captorFunction(queenName, Memory.census.queenObject[queenName]);
    captorWorkerFunction(queenName, Memory.census.queenObject[queenName]);
  
    runarchitect(queenName);

    if (Memory.census.queenObject[queenName].hostilePower > 1){
        defenseFunction(queenName);
    }
    
}

function normalEconomySpawning(queenName, beeLevel, phase){

    var queenObject = Memory.census.queenObject[queenName];
    var bees = queenObject.bees;
    var energyNow = queenObject.energyNow;
    var localSources = queenObject.localSources;
    var inactiveSpawns = queenObject.inactiveSpawns;

    if (_.isEmpty(bees)){
        // This runs only if we have 0 bees anywhere.
        if (beeLevel == 1 || energyNow < 500){
            // This will run if our creep level is 1, meaning that we're probably starting off
            // or things are really bad.
            creepCreator(inactiveSpawns[0], "starter", 1, queenName);
            return true;
        }
        else{
            // If our Bee Level isn't 1, then our structures are OK- just we have no creeps,
            // and we should probably try to spin something larger up.

            // TODO: Write some more normal functionality for this edgecase.
            return true;
        }
    }

    // So from the Herald's queen object, get the array of 
    // bees that exist with harvester and hauler tasks.

    var droneArray = bees.drone;
    var upgraderArray = bees.upgrader;

    var harvestedSourceArray=[];
    var hauledSourceObject={};
    var shippedSourceObject={};

    hauledSourceObject = Memory.census.queenObject[queenName].hauledSourceObject;

    var storage = queenObject.storage;

    // So what isn't being mined?  unharvestSourceArray is an array of the leftover,
    // unmined sources.
    var localSources = queenObject.localSources;
    var harvestedSourceArray = queenObject.harvestedSources;
    var unharvestedSourceArray = _.difference(localSources, harvestedSourceArray);

    var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];

    if (phase == "summer" && droneArray == undefined){
        creepCreator(inactiveSpawn, 
            'drone', 
            1,
            queenName
        );
        return true;
    }
    // Which should give us everyting we need.
    // So, for all our local sources:
    for (var source in localSources){
        // If we there are no harvesters assinged to this source...
        if (unharvestedSourceArray.includes(localSources[source])){
            // Create a harvester bee and set it loose on the source.
            // Return cuz we're done.
            var container = common.findContainerIDFromSource(localSources[source]);
            
            if (container){
                creepCreator(inactiveSpawn, 
                                'harvester', 
                                beeLevel,
                                queenName,
                                {'source':localSources[source],
                                'pickupID': container.id,
                                'container': 1
                                }
                            );
                return true;
            }
            else{
                 creepCreator(inactiveSpawn, 
                                'harvester', 
                                beeLevel,
                                queenName,
                                {'source':localSources[source]}
                            );
                return true;
            }
        }
        // If we HAVE a real storage, we can be more specialized, and therefore, CPU efficent.
        // else if (storage) was here, but this all seems crazy.
        else if (storage){
            if(!hauledSourceObject[localSources[source]] || hauledSourceObject[localSources[source]].length < noCollector){
                creepCreator(inactiveSpawn, 
                                    'collector', 
                                    beeLevel,
                                    queenName,
                                    {'source':localSources[source],
                                    'storage': storage}
                                );
                return true;
            }
        }
        // If not, haulers do basically everything.
        else if (!hauledSourceObject[localSources[source]] || hauledSourceObject[localSources[source]].length < noHaulers){
            // Otherwise, if hauledSourceObject doesn't have a value withe the key
            // of source, we know that source doesn't have haulers.
            // If it does, but he count is below our const, we still need more.
            creepCreator(inactiveSpawn, 
                'worker',
                beeLevel, 
                queenName,
                {'source':localSources[source]}
            );
            return true;
        }
    }
    noUpgraders = 2;
    if (storage){
        var storEng = Game.getObjectById(storage).store.energy;
        if (storEng > 250000){
            noUpgraders++;
        }
        if (storEng > 500000){
            noUpgraders++;
        }
        if (storEng > 750000){
            noUpgraders++;
        }
    }
    if (upgraderArray == undefined){
        creepCreator(inactiveSpawn, 
                            'upgrader', 
                            1,
                            queenName
                        );
        return true;
    }
    if (droneArray == undefined && queenObject["energyNow"] < 301 && storage){
        creepCreator(inactiveSpawn, 
                            'drone', 
                            1,
                            queenName
                        );
        return true;
    }
    else if ((droneArray == undefined || droneArray.length < noDrones) && storage){
        creepCreator(inactiveSpawn, 
                            'drone', 
                            beeLevel,
                            queenName
                        );
        return true;   
    }
    else if (upgraderArray.length < noUpgraders){
        creepCreator(inactiveSpawn, 
                            'upgrader', 
                            beeLevel,
                            queenName
                        );
        return true;
    }
    return false;
};

function maintenanceSpawning(queenName, beeLevel, phase){
    
    var carpenterArray = Memory.census.queenObject[queenName].bees.carpenter;
    var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];
    var level = Memory.census.queenObject[queenName].level;
    var noCarpenters = 1;
    if (phase == "summer"){
        noCarpenters++;
    }
    
    if (level > 1){
        if (carpenterArray && carpenterArray.length < noCarpenters || (!carpenterArray && noCarpenters > 0)){
            creepCreator(           inactiveSpawn, 
                                    'carpenter', 
                                    beeLevel,
                                    queenName
                                );
            return true;
        }
    }
    return false;
}

function scoutSpawning(queenName, beeLevel, phase){
    var scoutArray = Memory.census.queenObject[queenName].bees.scout;
    var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];
    if (Memory.census.queenObject[queenName].imperialOrder.type == "expand"){
        var noScouts = 1;
        if (scoutArray && scoutArray.length < noScouts || (!scoutArray && noScouts > 0)){
            
            creepCreator(           inactiveSpawn, 
                                    'scout', 
                                    beeLevel,
                                    queenName,
                                    {'mission':'expand'}
                                );
            return true;
            
        }
    }
    return false;
    // var scoutArray = Memory.census.queenObject[queenName].bees.scout;
    // var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];
    // var remoteRooms = Memory.census.queenObject[queenName].remoteRooms;

    // var exits = Game.map.describeExits(queenName);
    // var incompleteBool = 0;

    // for (var exit in exits){
    //     if (!remoteRooms[exits[exit]]){
    //         incompleteBool = 1;
    //     }
    //     else if (!remoteRooms[exits[exit]].armComplete){
    //         incompleteBool = 1;
    //     }
    // }

    // var noScouts = 1;

    // if (incompleteBool){
    //     if (scoutArray && scoutArray.length < noScouts || (!scoutArray && noScouts > 0)){
    //         creepCreator(           inactiveSpawn, 
    //                                 'scout', 
    //                                 1,
    //                                 queenName,
    //                                 {'mission':'remote'}
    //                             );
    //         return true;
    //     }
    // }
    // return false;
}

function captureSpawning(queenName, beeLevel, phase){
    var territoryObject = Memory.census.queenObject[queenName].territoryObject;
    var target = Memory.census.queenObject[queenName].imperialOrder.target;

    var captureArray = Memory.census.queenObject[queenName].bees.captor;
    var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];
    if(typeof captureArray == 'undefined'){
        db.vLog("Spawning Captor.");
        creepCreator(inactiveSpawn, 
                                    'captor', 
                                    beeLevel,
                                    queenName,
                                    {'targetRoom':target}
                                );
        return true;
    }
    var captorBuilderArray = Memory.census.queenObject[queenName].bees.captorBuilder;
    if (typeof captorBuilderArray == 'undefined' ||
    captorBuilderArray.length < 4){
        db.vLog("Spawning Captor Builder.");
        creepCreator(inactiveSpawn, 
                                    'captorBuilder', 
                                    beeLevel,
                                    queenName,
                                    {'targetRoom':target}
                                );
        return true;
    }
}

function remoteEconomySpawning(queenName, beeLevel, phase){
    var remoteRooms = Memory.census.queenObject[queenName].remoteRooms;
    var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];
    for (var room in remoteRooms){
        if (remoteRooms[room].owner == false && remoteRooms[room].sources.length > 0){
            if (remoteRooms[room].reserverBee){
                var sources = remoteRooms[room].sources;
                var harvestedSourceArray = [];
                harvestedSourceArray = remoteRooms[room].harvestedSources;
                var hauledSourceObject = remoteRooms[room].hauledSourceObject;
                if (!hauledSourceObject){
                    hauledSourceObject = {};
                }
                for (var source in sources){
                    if (!harvestedSourceArray || !harvestedSourceArray.includes(sources[source].id)){
                        creepCreator(inactiveSpawn, 
                            'remoteHarvester', 
                            beeLevel,
                            queenName,
                            {'source':sources[source],
                            'remoteRoom': room
                            }
                        );
                        return true;
                    }
                    else if (!hauledSourceObject[sources[source].id] || hauledSourceObject[sources[source].id].length < noHaulers){
                        creepCreator(inactiveSpawn, 
                            'remoteWorker', 
                            beeLevel,
                            queenName,
                            {'source':sources[source],
                            'remoteRoom': room
                            }
                        );
                        return true;
                    }
                }
            }
            else {
                creepCreator(inactiveSpawn, 
                    'reserver', 
                    beeLevel,
                    queenName,
                    {'remoteRoom': room}
                );
                return true;
            }
        }
    }
    return false;
} 

// A simple check, based on our max energy storage, on how advanced we want our creeps to be.
function calculateLevel(energyMax, queenName){
    if (energyMax < 550 || Game.rooms[queenName].find(FIND_MY_CREEPS).length <= 2){
        return 1;
    }
    else if (550 <=  energyMax && energyMax < 800){
        return 2;
    }
    else if (800 <= energyMax && energyMax < 1300){
        return 3;
    }
    else if (1300 <= energyMax){
        return 4;
    }
};

function determineQueenPhase(queenName){

    // A queen has a few different phases depending on where we are
    // in the process of building a hive.

    var queenLevel = Memory.census.queenObject[queenName].level;
    var storage = Memory.census.queenObject[queenName].storage;

    // If we're below level 4, or we don't have a storage,
    // we're still in a growth phase and we should consider it 
    // "Spring".
    var storEng = 0;  
    if (storage){
        storEng = Game.getObjectById(storage).store.energy
    }

    if (queenLevel >= 4 && storEng > 10000){
        return "summer";
    }
    else{
        return "spring";
    }
}

function defenseFunction(queenName){
    if (true){
        var hostiles = Game.rooms[queenName].find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username; 
            console.log(username != 'staxwell' && username != 'Huggable_Shark');
            if (username != 'staxwell'){ 
                // Game.notify(`User ${username} spotted in room ${queenName}`);
            } 
            if (username != 'staxwell' && username != 'Huggable_Shark'){
                var towers = Game.rooms[queenName].find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.attack(hostiles[0]));
            }
        }
    }
}