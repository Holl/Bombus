var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName, queenObj){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.


    var harvesterArray = Memory.census.queenObject[queenName].bees.harvester;
    for (var bee in harvesterArray){
        var beeName = harvesterArray[bee];
        var beeObj = Game.creeps[beeName];
        var source = Game.getObjectById(beeObj.memory.source);
        beeFunc.mineSource(beeObj, source);
    }
}