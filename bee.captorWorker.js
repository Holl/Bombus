var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.


    var captorBuilder = Memory.census.queenObject[queenName].bees.captorBuilder;
    for (var bee in captorBuilder){
        var beeName = captorBuilder[bee];
        var bee = Game.creeps[beeName];
        if(bee.room.name != bee.memory.targetRoom){
            bee.moveTo(new RoomPosition(25, 25, bee.memory.targetRoom));
        }
        else{
            var source = bee.pos.findClosestByPath(FIND_SOURCES);
            if (bee.carry.energy == bee.carryCapacity){
                bee.memory.status = 'full';
            }
            else if (bee.carry.energy == 0){
                bee.memory.status = 'empty';
            }

            if(bee.memory.status == 'empty') {
                if(bee.harvest(source) == ERR_NOT_IN_RANGE) {
                    bee.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                else(bee.harvest(source));
            }
            else if (bee.memory.status == 'full'){
                var spawns = bee.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN)
                    }
                });
                constructs = bee.room.find(FIND_CONSTRUCTION_SITES);

                if (constructs && constructs.length > 0){

                    if(bee.build(constructs[0]) == ERR_NOT_IN_RANGE) {
                        bee.moveTo(constructs[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else {
                    common.upgradeController(bee);
                }
            }
        }
    }
}