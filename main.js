// 
//   Bombus
//     _  _
//    | )/ )
// \\ |//,' __
// (")(_)-"()))=-
//    (\\
// alsidfhjalkj

// Some debug tools:
var db = require('tools.debug');

var runCensus = require('counselor.census');
var runQueen = require('ai.queen')

module.exports.loop = function () {
    db.vLog("~~~~~~~~~~~~~~~~"+ Game.time+"~~~~~~~~~~~~~~~~");
    
    runCensus();
    var queenObjects = Memory.census['queenObject'];

    for (var queenName in queenObjects){
    	runQueen(queenName);
    }

    db.vLog("~~~~~~~~Final Log~~~~~~~~");
    db.vLog("Currently " + Game.cpu.bucket + 
        " in the bucket, with " + Game.cpu.tickLimit + 
        " as the current tick limit.");
    db.vLog("Final CPU used = " + Game.cpu.getUsed());
}