module.exports = function(){

    if (!Memory || !Memory.census){
        return false;
    }

    var empireObject = Memory.census.empireObject;
    var queenObject = Memory.census.queenObject;
    var queenCount = Object.keys(queenObject).length;
    var territoryObject = {};
    if (Memory.census.empireObject.territoryObject){
        territoryObject = Memory.census.empireObject.territoryObject;
    }
    else if (!Memory.census.empireObject.potentialTerritoryArray){
        for (var queen in queenObject){
            Memory.census.empireObject.potentialTerritoryArray = potentialTerritoryScan(queen, 25)
        }
    }
    
    var levelCount = empireObject.gcl.level;

    for (var queen in queenObject){
        if (queenCount < levelCount){
            if (queenObject[queen].storage == true && queenObject[queen].energyMax == 1300){
                Memory.census.queenObject[queen].imperialOrder = {type: "expand"}
                levelCount--;
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