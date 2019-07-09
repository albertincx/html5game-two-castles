class AI {
    reactionSpeed = 200;
    reactionPassed = 0;

    constructor() {
        game.castle.gold = -250;
        game.castle2.gold = -180;
    }

    makeDecision() {
        if (this.reactionPassed >= this.reactionSpeed) {
            let woodcutterCount = 0,
                archerCount = 0,
                knightCount = 0,
                enemyWoodcutterCount = 0,
                enemyArcherCount = 0,
                enemyKnightCount = 0;

            let sendWoodcutter = false,
                sendKnight = false,
                sendArcher = false;

            let playerUnits = [],
                aiUnits    = [];

            let closestEnemyUnit = false,
                hasFightingUnit = false;

            for (const id in game.stage.units) {
                const unit = game.stage.units[id];

                if (unit.player === 1) {
                    if (!closestEnemyUnit || closestEnemyUnit.x < unit.x) {
                        closestEnemyUnit = unit;
                    }
                    playerUnits[unit.id] = unit;

                    switch (unit.constructor.name) {
                        case "Woodcutter":
                            enemyWoodcutterCount++;
                            break;
                        case "Knight":
                            enemyKnightCount++;
                            break;
                        case "Archer":
                            enemyArcherCount++;
                            break;
                    }
                } else {
                    aiUnits[unit.id] = unit;

                    switch (unit.constructor.name) {
                        case "Woodcutter":
                            woodcutterCount++;
                            break;
                        case "Knight":
                            knightCount++;
                            break;
                        case "Archer":
                            archerCount++;
                            break;
                    }
                }
            }

            // WOODCUTTER
            game.stage.trees.forEach((tree, i) => {
                let isTreeNear = tree.x > parseInt(game.settings.worldWidth)/2;
                if (
                    isTreeNear && !woodcutterCount && (knightCount || archerCount || !Object.keys(playerUnits).length)
                    || (closestEnemyUnit && parseInt(closestEnemyUnit.x) + 300 < parseInt(tree.x))
                ) {
                    sendWoodcutter = true;
                    return true;
                }
            });

            if (sendWoodcutter) {
                document.getElementById('button_04').click();
            }

            // KNIGHT
            if ((closestEnemyUnit && parseInt(closestEnemyUnit.x) + 250 > game.castle2.x)
                || (enemyKnightCount > knightCount)
                || (enemyArcherCount <= 2 && enemyKnightCount === 0)
                || (knightCount > 3 && archerCount < 2 && enemyArcherCount < 4)
                || archerCount > 5) {
                sendKnight = true;
            }

            // ARCHER
            if (enemyArcherCount > archerCount
                || (enemyArcherCount > archerCount)
                || (enemyKnightCount <= 2 && enemyArcherCount === 0)
                || knightCount > 4) {
                sendArcher = true;
            }

            let canSendUnits = [];

            if (sendKnight) {
                canSendUnits.push('button_05');
            }
            if (sendArcher) {
                canSendUnits.push('button_06');
            }

            if (canSendUnits.length) {
                document.getElementById(canSendUnits[Math.floor(Math.random() * canSendUnits.length)]).click();
                // Если у противника юнитов в 2 раза больше, сократить время реакции
                if (Object.keys(aiUnits).length && (Object.keys(aiUnits).length * 2) <= (Object.keys(playerUnits).length)) {
                    setTimeout(() => {
                        document.getElementById(canSendUnits[Math.floor(Math.random() * canSendUnits.length)]).click();
                    }, 1500);
                }
            }
            // Если у противника какого юнита в 2 раза больше, вызвать такого же вне очереди
            if (knightCount && enemyKnightCount > knightCount * 3) {
                setTimeout(() => {
                    document.getElementById('button_05').click();
                }, 1500);
            }

            if (archerCount && enemyArcherCount > archerCount * 3) {
                setTimeout(() => {
                    document.getElementById('button_06').click();
                }, 1500);
            }

            if (knightCount * 2 > enemyKnightCount) {
                this.reactionPassed = 0;
            }
            if (archerCount * 2 > enemyArcherCount) {
                this.reactionPassed = 0;
            }

            this.reactionPassed = 0;
            this.reactionSpeed = 200 + Math.floor(Math.random() * 50) + 1;
        } else {
            this.reactionPassed++;
        }
    }
}