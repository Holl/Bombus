var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.


    var captorArray = Memory.census.queenObject[queenName].bees.captor;
    for (var bee in captorArray){
        var beeName = captorArray[bee];
        var bee = Game.creeps[beeName];
        if(bee.room.name != bee.memory.targetRoom){
            bee.moveByPath(beeFunc.pathAvoidingRooms(bee, bee.memory.targetRoom), {visualizePathStyle: {stroke: '#ffffff'}});
        }
        else{
            if(bee.room.controller) {
                if(bee.claimController(bee.room.controller) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(bee.room.controller);
                }
                else if(bee.claimController(bee.room.controller) == ERR_INVALID_TARGET){
                    if (bee.room.controller.owner.username == "KEVIN"){
                        var spawns = bee.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN)
                            }
                        });
                        var constructions = bee.room.find(FIND_CONSTRUCTION_SITES);
                        if (spawns.length == 0 && constructions.length == 0){
                            console.log("Let's set it up.");
                            var spawnLoc = common.findCenterSpawnLocation(bee.room.name);
                            bee.room.createConstructionSite(spawnLoc.x,spawnLoc.y,STRUCTURE_SPAWN)
                        }
                        else{
                            // Nothing at the moment.
                        }
                    } 
                    else{
                        bee.attackController(bee.room.controller);
                    }  
                }
            }
        }
    }
}