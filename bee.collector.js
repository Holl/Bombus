var beeFunc = require('tools.beeFunctions');
var common = require('tools.commonFunctions');

module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.


    var collectorArray = Memory.census.queenObject[queenName].bees.collector;
    for (var bee in collectorArray){
        var beeName = collectorArray[bee];
        var bee = Game.creeps[beeName];
        if(bee.carry.energy == 0){      
            if(!bee.memory.pickupID){
                var source = Game.getObjectById(bee.memory.source);
                bee.memory.pickupID = common.findContainerIDFromSource(source.id);
            }
            var pickup = Game.getObjectById(bee.memory.pickupID);
            if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_NOT_IN_RANGE){
                bee.moveTo(pickup.pos)
            }
            else if (bee.withdraw(pickup, RESOURCE_ENERGY)== ERR_INVALID_TARGET){
                if(bee.pickup(target) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(target.pos);
                }
            }

        }
        else{
            var storageID = bee.memory.storage;
            var storage = Game.getObjectById(storageID);

            if(bee.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                bee.moveTo(storage);
            }
        }
    }
}