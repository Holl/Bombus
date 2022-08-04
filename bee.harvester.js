var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName, queenObj){

    // A bee dedicated to simply moving to a source,
    // and mining it until death.

    for (var bee in queenObj['bees']['harvester']){
        var beeName = queenObj['bees']['harvester'][bee];
        var beeObj = Game.creeps[beeName];
        source = Game.getObjectById(beeObj.memory.source);
        beeFunc.mineSource(beeObj, source);
    }
}