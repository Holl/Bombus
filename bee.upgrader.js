var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){


    var upgraderArray = Memory.census.queenObject[queenName].bees.upgrader;
    var source = Memory.census.queenObject[queenName].localSources[0]
    for(var bee in upgraderArray){
        var beeName = upgraderArray[bee];
        var bee = Game.creeps[beeName];
        if(bee.carry.energy == 0){      
            if (bee.memory.storage){
                var storageID = bee.memory.storage;
                var storage = Game.getObjectById(storageID);
                // ?? Feels like there should be some GOTO storage logic here
            }
            else if (bee.memory.pickupID){
                var target = Game.getObjectById(bee.memory.pickupID);
                if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(target.pos);
                }
                else if(target && target.structureType == 'container'){
                     if (bee.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        bee.moveTo(target.pos)
                    }
                }
                else if (!target){
                    bee.memory.pickupID = common.findContainerIDFromSource(source.id); 
                }
            }
            else{
                var storageObj = Game.rooms[queenName].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}});
                var storage = storageObj[0]; 
                if (storage){
                    bee.memory.storage = storageObj[0].id;
                }
                else{
                    if (Game.rooms[queenName].controller){
                        var source = Game.rooms[queenName].controller.pos.findClosestByPath(FIND_SOURCES);
                        if (source){
                            var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                            if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                                bee.moveTo(target.pos);
                            }
                            else if (!target){
                                bee.memory.pickupID = common.findContainerIDFromSource(source.id); 
                            }
                        }
                    }
                }
                // This doesn't work pre storage, need a fix
            }
            if(bee.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                bee.moveTo(storage);
            }
        }
        else{
            common.upgradeController(bee);
            var signer = "Bombus A.I. at work";
            if (!(bee.room.controller.sign) || !(bee.room.controller.sign.text == signer)){
                if(bee.signController(bee.room.controller, signer) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(bee.room.controller);
                }
            }
            
        } 
    }
    
}