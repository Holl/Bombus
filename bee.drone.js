module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.


    var droneArray = Memory.census.queenObject[queenName].bees.drone;
    var thirstyStructures = Memory.census.queenObject[queenName].thirstyStructures;
    for (var bee in droneArray){
        var bee = Game.creeps[droneArray[bee]];
        if(bee.carry.energy == 0){      
            if (bee.memory.storage){
                var storageID = bee.memory.storage;
                var storage = Game.getObjectById(storageID);
            }
            else{
                var storageObj = Game.rooms[queenName].find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}});
                var storage = storageObj[0];

            }
            if(bee.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                bee.moveTo(storage);
            }
        }
        else{
            if (thirstyStructures.length > 0 || bee.memory.deliveryTargetID){
                if(!bee.memory.deliveryTargetID){
                    // And if we have a delivery target, we should go to it to deliver.
                    bee.memory.deliveryTargetID = thirstyStructures[0]['id'];
                    if (thirstyStructures[0]['thirst'] < bee['carry']['energy']){
                        thirstyStructures.splice(0,1);
                    }
                    else{
                        thirstyStructures[0]['thirst'] = thirstyStructures[0]['thirst'] - bee['carry']['energy'];
                    }
                }
                var deliveryID = bee.memory.deliveryTargetID;
                var deliveryObj = Game.getObjectById(deliveryID);
                // If we don't have a delivery target, grab the first on the list
                // and reduce or remove it from the list.
                bee.transfer(deliveryObj, RESOURCE_ENERGY);               
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(deliveryObj);
                }
                if(bee.transfer(deliveryObj, RESOURCE_ENERGY) == ERR_FULL){
                    bee.memory.deliveryTargetID = '';
                }
            }
        }
    }
}