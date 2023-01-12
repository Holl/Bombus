var common = require('tools.commonFunctions');
var db = require('tools.debug');
var beeFunc = require('tools.beeFunctions');

module.exports = function(queenName){

    var scoutArray = Memory.census.queenObject[queenName].bees.scout;

	for (var beeIndex in scoutArray){
		var ourBee = Game.creeps[scoutArray[beeIndex]];
		var currentRoomName = ourBee.room.name;

        if(ourBee.memory.mission == "remote"){
            if (ourBee.memory.targetRoom){
                if (ourBee.memory.targetRoom == currentRoomName){
                    ourBee.moveTo(25,25,ourBee.memory.targetRoom);
                    var data = common.scoutSnapshot(currentRoomName);
                    if(!Memory.census.queenObject[queenName].remoteRooms[currentRoomName]){
                        Memory.census.queenObject[queenName].remoteRooms[currentRoomName] = data;
                    }
                    ourBee.memory.targetRoom = null;
                }
                else {
                    if (ourBee.moveTo(new RoomPosition(25,25,ourBee.memory.targetRoom), {maxRooms: 24, maxOps: 5000}) == ERR_NO_PATH){
                        db.vLog("This doesn't work.")
                    }
                }
            }
            else{
                var exits = Game.map.describeExits(currentRoomName);
                var remoteRooms = Memory.census.queenObject[queenName].remoteRooms;
                var queenCheck = false;
                var completedCheck = true;
                for (exit in exits){
                    if ((!remoteRooms[exits[exit]] || !remoteRooms[exits[exit]].armComplete) && exits[exit] != queenName){
                        ourBee.memory.targetRoom = exits[exit];
                        completedCheck = false;
                    }
                    if (exits[exit] == queenName || ourBee.room.name == queenName){
                        queenCheck = true;
                    }
                }
                if (queenCheck == false){
                    ourBee.suicide();
                }
                if (completedCheck){
                    Memory.census.queenObject[queenName].remoteRooms[currentRoomName].armComplete = true;
                    ourBee.suicide();
                }
                if (ourBee.moveTo(25,25,ourBee.memory.targetRoom, {}) == ERR_NO_PATH){
                    Memory.empress.scoutReports[ourBee.memory.targetRoom] = {
                        "reachable": false
                    }
                };
            }
        }
        else if (ourBee.memory.mission == "expand"){
            if (ourBee.memory.targetRoom){
                if (ourBee.memory.targetRoom == currentRoomName){
                    ourBee.moveTo(25,25,ourBee.memory.targetRoom);
                    var data = common.scoutSnapshot(currentRoomName);
                    if(!Memory.census.queenObject[ourBee.memory.queen].territoryObject[currentRoomName]){
                        Memory.census.queenObject[ourBee.memory.queen].territoryObject[currentRoomName] = data;
                        if (data.sources.length == 2){
                            var center = common.findCenterSpawnLocation(currentRoomName);
                            Memory.census.queenObject[ourBee.memory.queen].territoryObject[currentRoomName].spawnLoc = center;
                        }
                    }
                    removeRoomWhenScouted(currentRoomName, ourBee.memory.queen);
                    ourBee.memory.targetRoom = null;
                }
                else {
                    var territoryObject = Memory.census.queenObject[ourBee.memory.queen].territoryObject;
                    var playerOwnedTerritory = [];
                    for (var room in territoryObject){
                        if (territoryObject[room].owner && territoryObject[room].owner !='KEVIN'){
                            playerOwnedTerritory.push(room);
                        }
                    }
                    var scoutingRoute = Game.map.findRoute(ourBee.room, ourBee.memory.targetRoom, {
                        routeCallback(roomName, fromRoomName) {
                            if(playerOwnedTerritory.indexOf(roomName) > -1) {    // avoid this room
                                console.log("Avoiding " + roomName)
                                return Infinity;
                            }
                            return 1;
                        }
                    });

                    if (scoutingRoute == -2){
                        console.log("No path.");
                        removeRoomWhenScouted(ourBee.memory.targetRoom, ourBee.memory.queen);
                    }
                    else{
                        ourBee.moveTo(new RoomPosition(10,10,scoutingRoute[0].room), {visualizePathStyle: {stroke: 'white'}});
                    }
                };
            }
            else{
                if (Memory.census.queenObject[ourBee.memory.queen].imperialOrder.potentialTerritory){
                    var territoryArray = Memory.census.queenObject[ourBee.memory.queen].imperialOrder.potentialTerritory;
                    var distance = 10000;
                    var finalRoom = '';
                    for (var room in territoryArray){
                        var calculatedDistance = Game.map.findRoute(ourBee.memory.queen, territoryArray[room]);
                        if (calculatedDistance.length < distance){
                            distance = calculatedDistance.length;
                            finalRoom = territoryArray[room];
                        }
                    }
                    ourBee.memory.targetRoom = finalRoom;
                }
            }
        }
	}
}

function removeRoomWhenScouted(room, queenName){
    var array = Memory.census.queenObject[queenName].imperialOrder.potentialTerritory;

    var test = array.indexOf(room);
    if (test > -1){
        array.splice(test, 1);
        Memory.census.queenObject[queenName].imperialOrder.potentialTerritory = array;
    }
}