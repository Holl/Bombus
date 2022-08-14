module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.


    var droneArray = Memory.census.queenObject[queenName].bees.drone;
    var thirstyStructures = Memory.census.queenObject[queenName].thirstyStructures;
    for (var bee in droneArray){
        var beeName = droneArray[bee];
        var bee = Game.creeps[beeName];
        if (bee.memory.deliveryTargetID){
            for (var struct in thirstyStructuers){
                if (thirstyStructuers[struct]['id'] == bee.memory.deliveryTargetID){
                    if (thirstyStructuers[struct]['thirst'] < bee['carry']['energy']){
                        Memory.census.queenObject[queenName].thirstyStructures.splice(struct,1);
                    }
                    else{
                        Memory.census.queenObject[queenName].thirstyStructures[struct]['thirst'] = Memory.census.queenObject[queenName].thirstyStructures[struct]['thirst'] - bee['carry']['energy'];
                    }
                }
            }
        }
    }
}