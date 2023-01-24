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
var runCaptain =  require('counselor.captain');

module.exports.loop = function () {
    db.vLog("~~~~~~~~~~~~~~~~| Tick: "+ Game.time+" |~~~~~~~~~~~~~~~~");
    
    // Census will update our Memory with the game's current state.
    runCensus();

    runEmpress();
 
    var queenObjects = Memory.census.queenObject;

    for (var queenName in queenObjects){
    	runQueen(queenName);
    }

    runCaptain();

    db.vLog("~~~~~~~~Final Log~~~~~~~~");
    var bucketBar = '[';
    var bucketPercentage = Math.round(Game.cpu.bucket/100);
    var bucketLeftovers = 100 - bucketPercentage;
    for (var i=0; i<bucketPercentage; i++){
        bucketBar+="#"
    }
    for (var i=0; i<bucketLeftovers; i++){
        bucketBar+=" "
    }
    bucketBar+="] " + Game.cpu.bucket + " / 10,000 Bucket CPU";
    db.vLog(bucketBar);
    db.vLog("Final CPU used = " + Game.cpu.getUsed());
    db.vLog(" ");

    if(false) {
        // Not doing this anymore- CPU too valuable.
        Game.cpu.generatePixel();
        db.vLog("Buring bucket to generate a pixel.");
    }
}