var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.

    var farvesterArray = Memory.census.queenObject[queenName].bees.farvester;
    for (var bee in farvesterArray){
        var beeName = farvesterArray[bee];
        var beeObj = Game.creeps[beeName];
        var source = Game.getObjectById(beeObj.memory.source);
        beeFunc.mineSource(beeObj, source);
    }
}