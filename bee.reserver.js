var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.

    var reserverArray = Memory.census.queenObject[queenName].bees.reserver;
    for (var bee in reserverArray){
        var beeName = reserverArray[bee];
        var beeObj = Game.creeps[beeName];
        var targetRoom = beeObj.memory.remoteRoom;
        var currentRoom = beeObj.room.name;
        if (targetRoom == currentRoom){
            beeFunc.reserveRoom(beeObj)
        }
        else{
            beeObj.moveTo(new RoomPosition(25,25,targetRoom), {visualizePathStyle:{}});
        }
    }
}