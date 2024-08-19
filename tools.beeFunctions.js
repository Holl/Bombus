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
	    if(bee.upgradeController(bee.room.controller, {maxRooms: 1}) == ERR_NOT_IN_RANGE) {
	        bee.moveTo(bee.room.controller, {maxRooms: 1});
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
    },
    pathAvoidingRooms(bee, targetRoomName){
        var avoidRooms = ['E18N19'];
        let exits = Game.map.findExit(bee.room.name, targetRoomName);
        let exitPos = bee.pos.findClosestByRange(exits);

        return PathFinder.search(
            bee.pos, 
            { pos: exitPos, range: 0 },  // Target the exact exit position
            {
                plainCost: 2,
                swampCost: 10,
                roomCallback: targetRoomName => {
                    // If the room is in the avoidRooms list, return false to block the room
                    if (avoidRooms.includes(targetRoomName)) {
                        return false;
                    }

                    // Initialize a CostMatrix for the room
                    let costs = new PathFinder.CostMatrix();

                    let room = Game.rooms[targetRoomName];
                    if (room) {
                        room.find(FIND_STRUCTURES).forEach(function(struct) {
                            if (struct.structureType === STRUCTURE_ROAD) {
                                // Assign a moderate cost to roads rather than the lowest possible
                                costs.set(struct.pos.x, struct.pos.y, 3);
                            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                    (struct.structureType !== STRUCTURE_RAMPART ||
                                        !struct.my)) {
                                // Can't walk through non-walkable buildings
                                costs.set(struct.pos.x, struct.pos.y, 255);
                            }
                        });
                    }

                    return costs; // Return the CostMatrix for the room
                },
                maxOps: 2000, // Maximum number of operations for pathfinding
                heuristicWeight: 1.2
            }
        ).path;
    }
}






