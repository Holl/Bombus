// 
//   Bombus AI
//     _  _
//    | )/ )
// \\ |//,' __
// (")(_)-"()))=-
//    (\\
// 

// Bombus AI is a screeps AI, designed as an imagined cluster of bee hives.

var db = require('tools.debug');
var commmon = require('tools.commonFunctions');

var runCensus = require('counselor.census');
var runQueen = require('ai.queen')
var runEmpress =  require('ai.empress');

module.exports.loop = function () {
    db.vLog("~~~~~~~~~~~~~~~~| Tick: "+ Game.time+" |~~~~~~~~~~~~~~~~");
    
    // Census will update our Memory with the game's current state.
    runCensus();

    runEmpress();
 
    var queenObjects = Memory.census.queenObject;

    for (var queenName in queenObjects){
    	runQueen(queenName);
    }

    db.vLog("~~~~~~~~Final Log~~~~~~~~");
    db.vLog("Currently " + Game.cpu.bucket + 
        " in the bucket, with " + Game.cpu.tickLimit + 
        " as the current tick limit.");
    db.vLog("Final CPU used = " + Game.cpu.getUsed());
    db.vLog(" ");
}