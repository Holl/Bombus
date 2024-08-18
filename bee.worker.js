var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){

    // WORKER BEES
    // Worker bees, like their real life counterpart, are the ones who actually get the
    // resources and deliver it to where it needs to go in the hive.
    
    var workerArray = Memory.census.queenObject[queenName].bees.worker;

    for (var bee in workerArray){
        var beeName = workerArray[bee];
        var bee = Game.creeps[beeName];
        var source = Game.getObjectById(bee.memory.source);
        if(bee.carry.energy == 0){
            // If we don't have any energy, we want to reset and find our resource.
            bee.memory.deliveryTargetID = '';
            if (bee.memory.pickupID){
                // If we stored where we need to pick up, go there.
                var pickup = Game.getObjectById(bee.memory.pickupID);
                if (!pickup){
                    // Handler if this doesn't exist.
                    bee.memory.pickupID = common.findContainerIDFromSource(source.id);
                    pickup = Game.getObjectById(bee.memory.pickupID);
                }
                if (pickup.progressTotal){
                    var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                    if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(target.pos, {maxRooms: 1});
                    }
                }
                else{
                    if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                        bee.moveTo(pickup.pos, {maxRooms: 1})
                    }
                    else if (bee.withdraw(pickup, RESOURCE_ENERGY) == ERR_INVALID_TARGET){
                        bee.memory.pickupID = common.findContainerIDFromSource(source.id);
                    }
                }
            }
            else{
                var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(target.pos, {maxRooms: 1});
                }
                else if (!target){
                    bee.memory.pickupID = common.findContainerIDFromSource(source.id); 
                }
            }
        }
        else {
            // Otherwise we have some energy and should do something with
            // If we're here, there are buildings with Thirst...
            if(bee.memory.deliveryTargetID){
                // And if we have a delivery target, we should go to it to deliver.
                var deliveryID = bee.memory.deliveryTargetID;
                var deliveryObj = Game.getObjectById(deliveryID);
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(deliveryObj, {maxRooms: 1});
                }
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_FULL){
                    bee.memory.deliveryTargetID = '';
                }
            }
            else if (Memory.census.queenObject[queenName].thirstyStructures.length>0){

                // If we don't have a delivery target, grab the first on the list
                // and reduce or remove it from the list.
                bee.memory.deliveryTargetID = Memory.census.queenObject[queenName].thirstyStructures[0].id;

                if (Memory.census.queenObject[queenName].thirstyStructures[0].thirst < bee.carry.energy){
                    Memory.census.queenObject[queenName].thirstyStructures.splice(0,1);
                }
                else{
                    Memory.census.queenObject[queenName].thirstyStructures[0].thirst = Memory.census.queenObject[queenName].thirstyStructures[0].thirst - bee.carry.energy;
                }
            }
            else if (bee.memory.constructionId){
                var site = Game.getObjectById(bee.memory.constructionId);
                if(bee.build(site) == ERR_NOT_IN_RANGE){
                    bee.moveTo(site);
                }
                else if(bee.build(site) == -7){
                    bee.memory.constructionId = null;
                }
            }
            else if (Memory.census.queenObject[queenName].constructionSites.length > 0){
                var site = Game.getObjectById(Memory.census.queenObject[queenName].constructionSites[0]);
                if(bee.build(site) == ERR_NOT_IN_RANGE){
                    bee.moveTo(site);
                }
                bee.memory.constructionId=site.id;
            }
            else{
                common.upgradeController(bee);
            } 
        }
    }

   
}