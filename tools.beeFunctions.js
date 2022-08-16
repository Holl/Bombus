var db = require('tools.debug');
var common = require('tools.commonFunctions');

module.exports = {
	starterMining(beeName){
        var bee = Game.creeps[beeName];
        if (Memory.census){
            var source = Game.getObjectById(Memory.census.queenObject[bee.memory.queen].localSources[0]);
            if(bee.carry.energy < bee.carryCapacity) {
                if(bee.harvest(source) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(source);
                }
                else(bee.harvest(source));
            }
            else{
                var targets = bee.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_EXTENSION)&&
                        (structure.energy < structure.energyCapacity || 
                            structure.store < structure.storeCapacity))
                    }
                });
                if(targets.length > 0) {
                    if(bee.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(targets[0]);
                    }
                }
            }
        }

	},
	upgradeController(bee){
	    if(bee.upgradeController(bee.room.controller) == ERR_NOT_IN_RANGE) {
	        bee.moveTo(bee.room.controller);
	    }
	},
    mineSource(bee, source){
        if(bee.harvest(source) == ERR_NOT_IN_RANGE || bee.harvest(source) == ERR_BUSY) {
            if (bee.memory.pickupID){
                var container = Game.getObjectById(bee.memory.pickupID);
                bee.moveTo(container);
            }
            else{
                bee.memory.pickupID = common.findContainerIDFromSource(source.id);
                bee.moveTo(source);
            }
            
        }
        else{
            var container = Game.getObjectById(bee.memory.pickupID);
            bee.moveTo(container);
            bee.harvest(source);
            if(!bee.memory.container){
                bee.room.createConstructionSite(bee.pos.x, bee.pos.y, STRUCTURE_CONTAINER);
                bee.memory.container = 1;
            }
        }
    },
    reserveRoom(bee){
        if(bee.room.controller) {
            if(bee.reserveController(bee.room.controller) == ERR_NOT_IN_RANGE) {
                bee.moveTo(bee.room.controller);
            }
            else if(bee.reserveController(bee.room.controller) == ERR_INVALID_TARGET){
                console.log("I'm confused");
            }
        }
    }
}






