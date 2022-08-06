var noHaulers = 2;
var noShipper = 1;
var noDrones = 2;
var noUpgraders = 1;

var noHealers = 4;
var noTanks = 4;

var creepCreator = require('counselor.beeSpawner');
var db = require('tools.debug');
var starterFunction = require('bee.starter');
// var captureFunciton = require('bee.captor');
var harvesterFunction = require('bee.harvester');
var common = require('tools.commonFunctions');
// var maintenanceBeesFunction = require('bees.maintenance');
// var reconnaissanceBeesFunction = require('bees.reconnaissance');
// var defenseBeesFunction = require('bees.defense');
// var attackBeesFunction = require('bees.attack'); asdfasdf



module.exports = function(queenName){

    db.vLog("~~~~~~~~" + queenName + "~~~~~~~~");

    var phase = determineQueenPhase(queenName);

    var inactiveSpawns = Memory.census.queenObject[queenName].inactiveSpawns;
    var energyMax = Memory.census.queenObject[queenName].energyMax;
    
    if(inactiveSpawns.length > 0){

        var beeLevel = calculateLevel(energyMax, queenName);

        db.vLog("Bee level is " + beeLevel);        

        normalEconomySpawning(queenName, beeLevel);
    }
    else{
        db.vLog("There are no inactive spawns.")
    }

    starterFunction(queenName, Memory.census.queenObject[queenName]);
    harvesterFunction(queenName, Memory.census.queenObject[queenName]);
    // maintenanceBeesFunction(queenName, queenObject);
    // defenseBeesFunction(queenName, queenObject, empressOrders);
    
    // captureFunciton(queenName, queenObject, empressOrders);
    // reconnaissanceBeesFunction(queenName, queenObject, empressOrders);
    // defnseFunction(queenName, queenObject, empressOrders);
    // attackBeesFunction(queenName, queenObject, empressOrders);
    
}

function determineQueenPhase(queenName){

    // A queen has a few different phases depending on where we are
    // in the process of building a hive.

    var queenLevel = Memory.census.queenObject[queenName].level;
    var storage = Memory.census.queenObject[queenName].storage;

    // If we're below level 4, or we don't have a storage,
    // we're still in a growth phase and we should consider it 
    // "Spring".  
    
    if (queenLevel < 4 || storage == false){
        return "spring";
    }
    // Otherwise, if we ahve those things, we're ready for more specalized 
    // bees and we're in "Summer"
    else{
        return "summer";
    }

}

function attackSpawning(queenName, queenObject, beeLevel, empressOrders){
    if (empressOrders && empressOrders.order == "flightAttack"){
        console.log(empressOrders.unit);
    }
}

function pickExpandRoom(roomsArray, scoutData){
    var topPick='';
    for (roomIndex in roomsArray){
        var roomName = roomsArray[roomIndex];
        var roomData = scoutData[roomName];

        if (roomData['capturable']){
            if(roomData['owner'] == false){
                if (roomData['deposits']){
                    if(Game.rooms[roomName] == undefined || !Game.rooms[roomName].controller.my ){
                        topPick = roomName;
                    }
                }
            }
        }
    }
    return topPick;
}

function reconnaissanceSpawning(queenName, queenObject, beeLevel, empressOrders){
    var scoutArray = queenObject['bees']['scout'];
    if (scoutArray == undefined || scoutArray.length < 1){
        db.vLog("Spawning Scout.");
        creepCreator(queenObject['inactiveSpawns'][0], 
                            'scout', 
                            1,
                            queenName
                        );
        return;
    }
}

function captureSpawning(queenName, queenObject, captureRoom, beeLevel){
    if (beeLevel > 2){
        var needCaptureBool = false;
        var roomObj = Game.rooms[captureRoom];
        if (roomObj == undefined || roomObj.controller.my != true){
            needCaptureBool = true
        }
        if(typeof queenObject['bees']['captor'] == 'undefined' && needCaptureBool){
            db.vLog("Spawning Captor.");
            creepCreator(queenObject['inactiveSpawns'][0], 
                                        'captor', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':captureRoom}
                                    );
            return;
        }
        if (typeof queenObject['bees']['captorBuilder'] == 'undefined' ||
            queenObject['bees']['captorBuilder'].length < 4){
            db.vLog("Spawning Captor Builder.");
            creepCreator(queenObject['inactiveSpawns'][0], 
                                        'captorBuilder', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':captureRoom}
                                    );
            return;
        }
        if (roomObj && roomObj.find(FIND_HOSTILE_CREEPS).length > 0 && (queenObject['bees']['defender'] == undefined || queenObject['bees']['defender'] < 2)){
            creepCreator(queenObject['inactiveSpawns'][0], 
                                        'defender', 
                                        beeLevel,
                                        queenName,
                                        {'targetRoom':captureRoom}
                                    );
        }
    }
}

function normalEconomySpawning(queenName, beeLevel){

    var queenObject = Memory.census.queenObject[queenName];
    var bees = queenObject.bees;
    var energyNow = queenObject.energyNow;
    var localSources = queenObject.localSources;
    var queenLevel = queenObject.level;
    var inactiveSpawns = queenObject.inactiveSpawns;

    if (_.isEmpty(bees)){
        // This runs only if we have 0 bees anywhere.
        if (beeLevel == 1 || energyNow < 500){
            // This will run if our creep level is 1, meaning that we're probably starting off
            // or things are really bad.
            db.vLog("Spawning starter.");
            creepCreator(inactiveSpawns[0], "starter", 1, queenName);
            return;
        }
        else{
            // If our Bee Level isn't 1, then our structures are OK- just we have no creeps,
            // and we should probably try to spin something larger up.

            // TODO: Write some more normal functionality for this edgecase.
            return;
        }
    }

    // So from the Herald's queen object, get the array of 
    // bees that exist with harvester and hauler tasks.

    var harvesterArray = bees.harvester;
    var haulerArray = bees.hauler;

    var shipperArray = bees.shipper;
    var droneArray = bees.drone;
    var upgraderArray = bees.upgrader;

    var tankArray = bees.tank;
    var healerArray = bees.healer;

    var harvestedSourceArray=[];
    var hauledSourceObject={};
    var shippedSourceObject={};

    // Loop through all of our harvesters.
    // The result of this is an array (harvestedSourceArray) of all the sources
    // currently being mined.

    // TOPDO: The following two loops seem REALLY similar,
    // and I probably have to do it again.  Make them wet


    // Specialization is a key concept in keeping things as simple and CPU efficent as possible.
    // When we start any room- basically any room from levels 1-4- we don't have any place to put
    // energy that's very efficent except for the conatiners.  Therefore the best thing any bee
    // can do with any energy is put it to good use by USING it.

    // That changes with Storage, however.  Once built, we have 1,000,000 units of storage and we can
    // have the bees dedicate themselves to one task.

    var storage = queenObject.storage;


    // So what isn't being mined?  unharvestSourceArray is an array of the leftover,
    // unmined sources.
    var localSources = queenObject.localSources;
    var harvestedSourceArray = queenObject.harvestedSources;
    var unharvestedSourceArray = _.difference(localSources, harvestedSourceArray);

    // Which should give us everyting we need.
    // So, for all our local sources:
    for (var source in localSources){
        // If we there are no harvesters assinged to this source...
        if (unharvestedSourceArray.includes(localSources[source])){
            // Create a harvester bee and set it loose on the source.
            // Return cuz we're done.
            db.vLog("Spawning Harvester.");
            var container = common.findContainerIDFromSource(localSources[source]);
            
            if (container){
                creepCreator(queenObject.inactiveSpawns[0], 
                                'harvester', 
                                beeLevel,
                                queenName,
                                {'source':localSources[source],
                                'pickupID': container.id,
                                'container': 1
                                }
                            );
                return;
            }
            else{
                 creepCreator(queenObject.inactiveSpawns[0], 
                                'harvester', 
                                beeLevel,
                                queenName,
                                {'source':localSources[source]}
                            );
                return;
            }
        }
        // If we HAVE a real storage, we can be more specialized, and therefore, CPU efficent.
        // else if (storage) was here, but this all seems crazy.
        else if (storage){
            if(!shippedSourceObject[localSources[source]] || 
                shippedSourceObject[localSources[source]].length < noShipper){
                db.vLog("Spawning Shipper.");
                creepCreator(queenObject['inactiveSpawns'][0], 
                                    'shipper', 
                                    beeLevel,
                                    queenName,
                                    {'source':localSources[source],
                                    'storage': storage}
                                );
                return;
            }
        }
        // If not, haulers do basically everything.
        else if (!hauledSourceObject[localSources[source]] || hauledSourceObject[localSources[source]].length < noHaulers){
            // Otherwise, if hauledSourceObject doesn't have a value withe the key
            // of source, we know that source doesn't have haulers.
            // If it does, but he count is below our const, we still need more.
            db.vLog("Spawning Hauler.");
            creepCreator(queenObject['inactiveSpawns'][0], 
                'hauler',
                beeLevel, 
                queenName,
                {'source':localSources[source]}
            );
            return;
        }
        else if (upgraderArray == undefined || upgraderArray.length < 1){
            db.vLog("Spawning Upgrader.");
            creepCreator(queenObject['inactiveSpawns'][0], 
                                'upgrader', 
                                1,
                                queenName
                            );
            return;
        }
    }

    noUpgraders = 1;
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
    if (droneArray == undefined && queenObject["energyNow"] < 301){
        db.vLog("Spawning Lvl 1 Drone.");
        creepCreator(queenObject['inactiveSpawns'][0], 
                            'drone', 
                            1,
                            queenName
                        );
        return;
    }
    else if ((droneArray == undefined || droneArray.length < noDrones) && queenLevel >=4){
        db.vLog("Spawning big Drone.");
        creepCreator(queenObject['inactiveSpawns'][0], 
                            'drone', 
                            beeLevel,
                            queenName
                        );
        return;   
    }
    else if (upgraderArray == undefined){
        db.vLog("Spawning Upgrader.");
        creepCreator(queenObject['inactiveSpawns'][0], 
                            'upgrader', 
                            1,
                            queenName
                        );
        return;
    }
    else if (upgraderArray.length < noUpgraders){
        db.vLog("Spawning Upgrader.  We should spin up " + noUpgraders);
        creepCreator(queenObject['inactiveSpawns'][0], 
                            'upgrader', 
                            beeLevel,
                            queenName
                        );
        return;
    }
};

function maintenanceSpawning(queenName, queenObject, beeLevel){

    var queenLevel = queenObject['level'];
    // var noWorkers = queenLevel - 1;
    var noWorkers = 1;

    if (queenObject['bees']['worker'] && queenObject['bees']['worker'].length < noWorkers || (!queenObject['bees']['worker'] && noWorkers > 0)){
        db.vLog("Spawning a worker.");
        creepCreator(queenObject['inactiveSpawns'][0], 
                                'worker', 
                                beeLevel,
                                queenName
                            );
    }
    return;
}

function defnseFunction(queenName, queenObject){
    if (true){
        var hostiles = Game.rooms[queenName].find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username; 
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