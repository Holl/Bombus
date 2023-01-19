const { attackSnapshot } = require("./tools.commonFunctions");

module.exports = function(){

    if (!Memory || !Memory.census){
        return false;
    }

    var empireObject = Memory.census.empireObject;
    var queenObject = Memory.census.queenObject;
    var queenCount = Object.keys(queenObject).length;
    
    var levelCount = empireObject.gcl.level;
    var fallQueens = [];

    for (var queen in queenObject){
        if (queenCount < levelCount){
            if (Memory.census.queenObject[queen].imperialOrder.type == "none"){
                if (queenObject[queen].storage && queenObject[queen].energyMax >= 1300){
                    Memory.census.queenObject[queen].imperialOrder.type = "expand";
                    Memory.census.queenObject[queen].imperialOrder.potentialTerritory = potentialTerritoryScan(queen, 25);
                    if(Memory.census.queenObject[queen].territoryObject){
                        Memory.census.queenObject[queen].territoryObject = {};
                    }
                    levelCount--;
                }
            }
            else if (Memory.census.queenObject[queen].imperialOrder.type == "expand" && Memory.census.queenObject[queen].imperialOrder.potentialTerritory.length > 0){
                if (Memory.census.queenObject[queen].territoryObject){
                    var territory = Memory.census.queenObject[queen].territoryObject;
                    for (var room in territory){
                        if (territory[room].spawnLoc && territory[room].owner == false){
                            Memory.census.queenObject[queen].imperialOrder.type = "capture";
                            Memory.census.queenObject[queen].imperialOrder.target = room;
                        }
                    }
                }
                levelCount--;
            }
            else if (Memory.census.queenObject[queen].imperialOrder.type == "expand" && Memory.census.queenObject[queen].imperialOrder.potentialTerritory.length == 0){
                Memory.census.queenObject[queen].imperialOrder.type = "fall";
            }
            else if (Memory.census.queenObject[queen].imperialOrder.type == "fall"){
                fallQueens.push(queen);
                Memory.census.queenObject[queen].imperialOrder.type = "sack";
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
    if (false){
        Memory.census.empireObject.liveAttacks[0]= {
            "room": "W56N43",
            "type": "drain",
            "prepRoom": "W57N43",
            "prepRoomRally": {"x":46,"y":29}
        }
        var swarmSize = 3;
        var swarmNo = 2;
        var fallQueenCount = 0;
        Memory.census.empireObject.liveAttacks[0].beesOnDeck = [
            { "swarmName": "alpha", 
                "swarmBees": ["tank", "healer", "healer"]},
            { "swarmName": "beta", 
                "swarmBees": ["tank", "healer", "healer"]},
        ]
    }

    var liveAttacks =  Memory.census.empireObject.liveAttacks;
    // if (liveAttacks.length > 0){
    //     var currentAttack = liveAttacks[0];
    //     var attackType = currentAttack.type;
    //     var attackTarget = currentAttack.room;
    //     var sortedQueenArray = sortRoomsByClosest(attackTarget, fallQueens);
    //     if (attackType == "drain"){
    //         var swarmSize = 3;
    //         var swarmNo = 2;
    //         var fallQueenCount = 0;
    //         Memory.census.empireObject.liveAttacks[0].beesOnDeck = [
    //             "tank", "healer", "healer", "tank", "healer", "healer"
    //         ]
    //     }
    // }

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

function sortRoomsByClosest(attackTarget, queenArray){
    return queenArray.sort(function(a, b){
        var route1 = Game.map.findRoute(attackTarget, a);
        var route2 = Game.map.findRoute(attackTarget, b);
        return route1.length-route2.length;
    })
}