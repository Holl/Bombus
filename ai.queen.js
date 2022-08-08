var noHaulers = 2;
var noShipper = 1;
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


module.exports = function(queenName){

    db.vLog("~~~~~~~~" + queenName + "~~~~~~~~");

    var phase = determineQueenPhase(queenName);
    var inactiveSpawns = Memory.census.queenObject[queenName].inactiveSpawns;
    var energyMax = Memory.census.queenObject[queenName].energyMax;
    
    if(inactiveSpawns.length > 0){

        var beeLevel = calculateLevel(energyMax, queenName);
        db.vLog("Bee level is " + beeLevel);

        scoutSpawning(queenName, beeLevel, phase);
        maintenanceSpawning(queenName, beeLevel, phase);
        normalEconomySpawning(queenName, beeLevel, phase);

    }
    else{
        db.vLog("There are no inactive spawns.")
    }

    starterFunction(queenName, Memory.census.queenObject[queenName]);
    harvesterFunction(queenName, Memory.census.queenObject[queenName]);
    workerFunction(queenName, Memory.census.queenObject[queenName]);
    carpenterFunction(queenName, Memory.census.queenObject[queenName]);
    upgraderFunction(queenName, Memory.census.queenObject[queenName]);
    scoutFunction(queenName, Memory.census.queenObject[queenName])

    runarchitect(queenName);
    
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
                creepCreator(inactiveSpawn, 
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
                 creepCreator(inactiveSpawn, 
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
                creepCreator(inactiveSpawn, 
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
            db.vLog("Spawning Worker.");
            creepCreator(inactiveSpawn, 
                'worker',
                beeLevel, 
                queenName,
                {'source':localSources[source]}
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
    if (upgraderArray == undefined){
        db.vLog("Spawning Upgrader.");
        creepCreator(inactiveSpawn, 
                            'upgrader', 
                            1,
                            queenName
                        );
        return;
    }
    if (droneArray == undefined && queenObject["energyNow"] < 301 && phase == "summer"){
        db.vLog("Spawning Lvl 1 Drone.");
        creepCreator(inactiveSpawn, 
                            'drone', 
                            1,
                            queenName
                        );
        return;
    }
    else if ((droneArray == undefined || droneArray.length < noDrones) && phase == "summer"){
        db.vLog("Spawning big Drone.");
        creepCreator(inactiveSpawn, 
                            'drone', 
                            beeLevel,
                            queenName
                        );
        return;   
    }
    else if (upgraderArray.length < noUpgraders){
        db.vLog("Spawning Upgrader.  We should spin up " + noUpgraders);
        creepCreator(inactiveSpawn, 
                            'upgrader', 
                            beeLevel,
                            queenName
                        );
        return;
    }
};

function maintenanceSpawning(queenName, beeLevel, phase){
    
    var carpenterArray = Memory.census.queenObject[queenName].bees.carpenter;
    var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];
    var level = Memory.census.queenObject[queenName].level;
    var noCarpenters = 1;
    if (phase == "summer"){
        // TODO: logical summer storage calculations
    }
    if (level > 1){
        if (carpenterArray && carpenterArray.length < noCarpenters || (!carpenterArray && noCarpenters > 0)){
            db.vLog("Spawning a carpenter.");
            creepCreator(           inactiveSpawn, 
                                    'carpenter', 
                                    beeLevel,
                                    queenName
                                );
            return;
        }
    }
    return;
}

function scoutSpawning(queenName, beeLevel, phase){

    var scoutArray = Memory.census.queenObject[queenName].bees.scout;
    var inactiveSpawn = Memory.census.queenObject[queenName].inactiveSpawns[0];

    var noScouts = 1;

    if (scoutArray && scoutArray.length < noScouts || (!scoutArray && noScouts > 0)){
        db.vLog("Spawning a scout.");
        creepCreator(           inactiveSpawn, 
                                'scout', 
                                1,
                                queenName,
                                {'mission':'remote'}
                            );
        return;
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