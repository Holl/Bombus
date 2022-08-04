var db = require('debugTools');

module.exports = {
	starterMining(beeName, queenObj){
        var source = Game.getObjectById(queenObj['localSources'][0]);
        var bee = Game.creeps[beeName];
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
	},
	upgradeController(bee){
	    if(bee.upgradeController(bee.room.controller) == ERR_NOT_IN_RANGE) {
	        bee.moveTo(bee.room.controller);
	    }
	},
}






