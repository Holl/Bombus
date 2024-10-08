var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName, queenObj){

    // Carpenter Bees are the main maintence bees.  They have the job of repairing
    // and helping build anything that needs built.

    var carpenterArray = Memory.census.queenObject[queenName].bees.carpenter; 
    var repairArray = Memory.census.queenObject[queenName].repairStructures;
    for (var bee in carpenterArray){
        // For every bee in this carptenter array
        var beeName = carpenterArray[bee];
        var ourBee = Game.creeps[beeName];
        if(ourBee.carry.energy == 0){
            ourBee.memory.repairTarget = '';
            if (ourBee.memory.pickupID){
                var container = Game.getObjectById(ourBee.memory.pickupID);
                if (ourBee.withdraw(container, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                    ourBee.moveTo(container.pos, {})
                }
            }
            else{
                var containers = ourBee.room.find(FIND_STRUCTURES, 
                    {filter: {structureType: STRUCTURE_CONTAINER }}
                );
                var storage = ourBee.room.find(FIND_STRUCTURES, 
                    {filter: {structureType: STRUCTURE_STORAGE }}
                );
                if (storage && storage.length>0){
                    containers = storage;
                }
                if (containers.length>0){
                    var container = ourBee.pos.findClosestByRange(containers);
                    ourBee.memory.pickupID = container.id;
                    if (ourBee.withdraw(container, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                        ourBee.moveTo(container.pos)
                    }
                }
            }
        }
        else{
            if (ourBee.memory.repairTarget){
                var storedTarget = Game.getObjectById(ourBee.memory.repairTarget);
                if (storedTarget){
                    if (storedTarget.hits < storedTarget.hitsMax){
                        ourBee.moveTo(storedTarget, {});
                        ourBee.repair(storedTarget);
                    }
                    else{
                        if (repairArray.length > 0 && repairArray[0]){
                            ourBee.memory.repairTarget = repairArray[0];
                            repairArray.splice(0,1);
                        }  
                        else{
                            ourBee.memory.repairTarget = '';
                        }
                    }
                }
                else{
                    ourBee.memory.repairTarget = '';
                }
            }
            else if (ourBee.memory.constructionId){
                var site = Game.getObjectById(ourBee.memory.constructionId);
                if(ourBee.build(site) == ERR_NOT_IN_RANGE){
                    ourBee.moveTo(site);
                }
                else if(ourBee.build(site) == -7){
                    if (site != null){
                        if (site.structureType == STRUCTURE_RAMPART){
                            ourBee.memory.repairTarget = ourBee.memory.constructionId;
                        }
                    }
                    ourBee.memory.constructionId = null;
                }

            }
            else if (Memory.census.queenObject[queenName].constructionSites.length > 0){
                var site = Game.getObjectById(Memory.census.queenObject[queenName].constructionSites[0]);
                if(ourBee.build(site) == ERR_NOT_IN_RANGE){
                    ourBee.moveTo(site);
                }
                ourBee.memory.constructionId=site.id;
            }
            else if(repairArray.length > 0){
                ourBee.memory.repairTarget = repairArray[0];
            }
        }
    }
}