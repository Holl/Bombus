module.exports = function(){

    if (!Memory || !Memory.census){
        return false;
    }

    var empireObject = Memory.census.empireObject;
    var queenObject = Memory.census.queenObject;
    var queenCount = Object.keys(queenObject).length;
    
    var levelCount = empireObject.gcl.level;

    for (var queen in queenObject){
        if (queenCount < levelCount){
            if (Memory.census.queenObject[queen].imperialOrder.type == "none"){
                if (queenObject[queen].storage && queenObject[queen].energyMax >= 1300){
                    Memory.census.queenObject[queen].imperialOrder.type = "expand";
                    Memory.census.queenObject[queen].imperialOrder.potentialTerritory = potentialTerritoryScan(queen, 25);
                    levelCount--;
                }
            }
            else if (Memory.census.queenObject[queen].imperialOrder.type == "expand"){
                if (Memory.census.queenObject[queen].territoryObject){
                    var territory = Memory.census.queenObject[queen].territoryObject;
                    for (var room in territory){
                        if (territory[room].spawnLoc){
                            Memory.census.queenObject[queen].imperialOrder.type = "capture";
                            Memory.census.queenObject[queen].imperialOrder.target = room;
                        }
                    }
                }
                levelCount--;
            }
            else if (Memory.census.queenObject[queen].imperialOrder.type == "capture"){
                var target = Memory.census.queenObject[queen].imperialOrder.target;
                if (Memory.census.queenObject[target]){
                    if (Memory.census.queenObject[target].energyMax >= 800){
                        Memory.census.queenObject[queen].imperialOrder = {type:"none"};
                    }
                }
            }
        }
    }
}

function potentialTerritoryScan(roomName, territorySize){
    // This absolutely will not work if we're flipping over the compass rose.

    var regexd = roomName.match(/[\d\.]+|\D+/g);
    var side = Math.sqrt(territorySize);
    var difference = (side-1)/2;

    var startRoom = [
        regexd[0],
        regexd[1] - difference,
        regexd[2],
        regexd[3] - difference
    ]

    var potentialTerritoryArray = [];

    for (var i = 0; i < side; i++){
        for (var y = 0; y < side; y++){
            potentialTerritoryArray.push(startRoom[0]+(startRoom[1]+i)+startRoom[2]+(startRoom[3]+y))
        }
    }
    return potentialTerritoryArray;
}