var common = require('tools.commonFunctions');

module.exports = function(queenName, queenObj){

    // WORKER BEES
    // Worker bees, like their real life counterpart, are the ones who actually get the
    // resources and deliver it to where it needs to go in the hive.
    
    var remoteWorkerArray = Memory.census.queenObject[queenName].bees.remoteWorker;
    var thirstyStructures = Memory.census.queenObject[queenName].thirstyStructures;

    for (var bee in remoteWorkerArray){
        var beeName = remoteWorkerArray[bee];
        var bee = Game.creeps[beeName];
        var room = bee.memory.remoteRoom; 
        var source = Game.getObjectById(bee.memory.source.id);
        if(bee.carry.energy == 0){
            // If we don't have any energy, we want to reset and find our resource.
            bee.memory.deliveryTargetID = '';
            if (source){
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
                            bee.moveTo(target.pos);
                        }
                    }
                    else{
                        if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                            bee.moveTo(pickup.pos)
                        }
                        else if (bee.withdraw(pickup, RESOURCE_ENERGY) == ERR_INVALID_TARGET){
                            bee.memory.pickupID = common.findContainerIDFromSource(source.id);
                        }
                    }
                }
                else{
                    var target = source.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
                    if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(target.pos);
                    }
                    else if (!target){
                        bee.memory.pickupID = common.findContainerIDFromSource(source.id); 
                    }
                }
            }
            else {
                bee.moveTo(new RoomPosition(25,25,room), {visualizePathStyle:{}});
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
                    bee.moveTo(deliveryObj);
                }
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_FULL){
                    bee.memory.deliveryTargetID = '';
                }
            }
            else if (thirstyStructures.length>0){

                // If we don't have a delivery target, grab the first on the list
                // and reduce or remove it from the list.
                bee.memory.deliveryTargetID = thirstyStructures[0]['id'];

                if (thirstyStructures[0]['thirst'] < bee['carry']['energy']){
                    thirstyStructures.splice(0,1);
                }
                else{
                    thirstyStructures[0]['thirst'] = thirstyStructures[0]['thirst'] - bee['carry']['energy'];
                }
            }
            else if (queenObj['constructionSites'].length > 0){
                var site = queenObj['constructionSites'][0];
                if(bee.build(site) == ERR_NOT_IN_RANGE){
                    bee.moveTo(site);
                }
            }
            else{
                common.upgradeController(bee);
            } 
        }
    }

   
}