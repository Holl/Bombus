var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions')

module.exports = function(queenName, queenObj){

    // STARTER BEES
    // Fire off the simple logic for our starter bees.
    // They really just grab some energy from a source to get us started.
    // Really super ineffective.

    var starterArray = Memory.census.queenObject[queenName].bees.starter;
    for(var bee in starterArray){
        var beeName = starterArray[bee];
        beeFunc.starterMining(beeName);
    }
}