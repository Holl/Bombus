var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.

    var remoteHarvesterArray = Memory.census.queenObject[queenName].bees.remoteHarvester;
    for (var bee in remoteHarvesterArray){
        var beeName = remoteHarvesterArray[bee];
        var beeObj = Game.creeps[beeName];
        var source = Game.getObjectById(beeObj.memory.source.id);
        var room = beeObj.memory.remoteRoom;
        if (source){
            beeFunc.mineSource(beeObj, source)
        }
        else{
            beeObj.moveTo(new RoomPosition(25,25,room), {visualizePathStyle:{}});
        }
    }
}