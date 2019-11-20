const MODE_TWO = 'twoPlayers'
let logTick = 0;
let twoPlayerUnit = {};

const game = {
    ai: false,
    arrow: false,
    settings: {
        worldWidth: 1024,
        worldHeight: 568,
        trees_max: 3,
        init_gold: 400,
        idle_gold: 5,
        idle_gold_cooldown_default: 250,
        idle_gold_cooldown: 250,
    },
    stage: {
        units: [],
        arrows: [],
        trees: [],
        clouds: [],
    },
    running: true,
    isGameOver: false,
    requestId: false,
    isPlayerTwo: false,

    // Start initializing objects, preloading assets and display start screen
    init() {
        //this.arrow = new Arrow();
        // Get handler for game canvas and context
        game.running = false;
        game.canvas = document.getElementById("gamecanvas");
        game.context = game.canvas.getContext("2d");
        game.stage.clouds.push(new Clouds(600, 50, 255, 76, 0.05, 'images/cloud_03.png'));
        game.stage.clouds.push(new Clouds(0, 100, 178, 75, 0.1, 'images/cloud_01.png'));
        game.stage.clouds.push(new Clouds(400, 200, 173, 52, 0.2, 'images/cloud_02.png'));
    },

    startGame(mode = '') {
        game.running = true;
        if (mode === MODE_TWO) {
            if (window.modeOnline && !window.onlinegid) {
                document.querySelector('.ingame-menu-online').style.display = 'block';
                document.getElementById(
                    'player-two-buttons').style.display = 'none';
            }
            document.getElementById("menu").style.display = "none";
            document.querySelector(".buttons").style.display = "block";
        }
        if (window.modeOnline && window.onlinegid) {
            this.isPlayerTwo = true;
        }
        game.isGameOver = false;
        // Castles
        game.castle = new Castle();
        game.castle2 = new Castle2();

        //document.querySelector('.buttons').style.display = 'block';
        game.stage.units = [];
        game.stage.trees = [];
        game.stage.arrows = [];
        game.ai = false;

        if (mode === 'onePlayer') {
            game.ai = new AI();
        }

        // Init gold
        game.changeGold(1, game.settings.init_gold);
        game.changeGold(2, game.settings.init_gold);

        document.querySelector('.ingame-menu').style.display = 'block';
        document.querySelector('.restart-button').style.display = 'block';
        if (socket) {
            if (window.onlinegid) {
                socket.on('game-event', (payload) => {
                    game.drawingLoop(payload);
                });
            } else {
                if (socket && !window.commandsHandled) {
                    window.commandsHandled = true;
                    socket.on('player-cmd', (command) => {
                        switch (command) {
                            case 'a': addWc(game);break;
                            case 's': addKn(game);break;
                            case 'd': addAr(game);break;
                            default: break;
                        }
                    });
                }
            }
        }
        if (!this.isPlayerTwo) {
            game.drawingLoop();
        }
    },

    drawingLoop(gameStage) {
        game.clearObject();
        if (!game.running) {
            return
        }
        if (gameStage && typeof gameStage === 'object') {
          this.fixStage(gameStage)
          game.stage = gameStage.stage;
          game.settings = gameStage.settings;
        }
        if (game.ai) {
            game.ai.makeDecision(game.stage);
        }

        // Clouds
        game.stage.clouds.forEach((cloud, i) => {
            cloud.draw(cloud);
        });

        // Castles
        game.castle.draw(gameStage && gameStage.castle);
        game.castle2.draw(gameStage && gameStage.castle2);

        // Trees
        game.stage.trees.forEach((tree, i) => {
            tree.draw(tree);
        });

        // Units
        const units = {}
        for (const id in game.stage.units) {
            const unit = game.stage.units[id];
            unit.draw();
            unit.action();
            unit.specialAction()
            units[id] = unit
        }
        logTick += 1;
        // Arrows
        game.stage.arrows.forEach((arrow, i) => {
            if (!arrow) return;
            let unit = game.stage.units[arrow.unit_id];
            if (typeof unit == "undefined") {
                unit = false;
            }

            if (arrow.t < 0) {
                if (unit) {
                    unit.health -= arrow.damage;
                }
                delete game.stage.arrows[i];
            }

            if (unit && unit.health <= 0) {
                game.removeBusyWith(unit.id);
                delete game.stage.units[unit.id];
                unit.shooting_with = [];
                unit.speed = self.default_speed;
            }

            arrow.draw();
        });

        if (game.stage.trees.length < game.settings.trees_max) {
            game.stage.trees.push(new Tree());
        }

        if (game.running) {
            if (this.isPlayerTwo) {
            } else {
                window.reqAnimation = requestAnimationFrame(game.drawingLoop);
            }
        }
        if (this.isPlayerTwo) {
        } else {
            --game.settings.idle_gold_cooldown;
        }
        if (game.settings.idle_gold_cooldown <= 0) {
            game.settings.idle_gold_cooldown = game.settings.idle_gold_cooldown_default;
            game.changeGold(1, game.settings.idle_gold);
            game.changeGold(2, game.settings.idle_gold);
        }
        if (window.modeOnline && !window.onlinegid) {
            socket.emit('game-event', { ...game, units });
        }
    },

    fixStage(gameStage) {
        gameStage.stage.clouds.forEach((cloud, i) => {
            gameStage.stage.clouds[i] = new Clouds(cloud.x, cloud.y,
                cloud.width,
                cloud.height, cloud.speed, cloud.src);
        });
        gameStage.stage.trees.forEach((tree, i) => {
            gameStage.stage.trees[i] = new Tree(tree.x, tree.y, tree.width,
                tree.height,
                tree.growth_rate, tree.time_to_grow, tree.has_grown);
        });
        if (gameStage.units) {
            for (const id in gameStage.units) {
                let unit1 = gameStage.units[id];
                let unit;
                switch (unit1.name) {
                    case 'knight':
                        unit = new Knight(unit1.id);
                        break;
                    case 'archer':
                        unit = new Archer(unit1.id);
                        break;
                    case 'woodcutter':
                        unit = new Woodcutter(unit1.id);
                        break;
                }
                if (unit) {
                    unit.set(unit1)
                    gameStage.units[id] = unit;
                }
            }
        }
        gameStage.stage.units = gameStage.units
        gameStage.stage.arrows.forEach((arrow, i) => {
            if (!arrow) return;
            gameStage.stage.arrows[i] = new Arrow(arrow.p0.x, arrow.p0.y,
                arrow.p3.x, arrow.p3.y, arrow.player, arrow.damage,
                arrow.unit_id, arrow.t);
        });
    },

    gameOver(win_player) {
        game.isGameOver = true;
        game.ai = false;
        game.stage.units = [];
        game.settings.idle_gold = 0;
        ///game.context.font = "40pt Arial";
        //game.context.fillText(text, 210, 240);
        win_player = win_player === 1 ? 'two' : 'one';
        document.querySelector('.game-results .result-data').textContent = "Player " + win_player + ' wins the game!';
        document.querySelector('.ingame-menu').style.display = 'none';



        game.showRestartButton();
        game.hideButtons();
    },

    restartGame() {
        window.cancelAnimationFrame(window.reqAnimation);
        document.querySelector('#menu').style.display = 'block';
        document.querySelector('.ingame-menu-online').style.display = 'none';
        document.querySelector('.restart-button').style.display = 'none';
        document.querySelector('.game-results').style.display = 'none';
        document.querySelector('.buttons').style.display = 'none';
        if (window.modeOnline) {
            game.startGame(MODE_TWO);
            return
        }
        game.castle = false;
        game.castle2 = false;
        game.running = true;

        game.stage.units = [];


    },

    hideButtons() {
        document.querySelector('#gamecontainer .buttons').style.display = 'none';
    },

    showRestartButton() {
        document.querySelector('.game-results').style.display = 'block';
        document.querySelector('.restart-button').style.display = 'block';
    },

    changeGold(player, gold) {
        if (player === 1) {
            game.castle.gold += parseInt(gold);
        } else {
            game.castle2.gold += parseInt(gold);
        }
    },
    checkGold(player, gold) {
        let remain_gold = game.castle.gold;
        if (player === 2) {
            remain_gold = game.castle2.gold;
        }
        if (remain_gold >= gold) {
            return true;
        }
        return false;
    },
    hireUnit(unit) {
        if (game.checkGold(unit.player, unit.cost)) {
            game.stage.units[unit.id] = unit;
            game.changeGold(unit.player, -unit.cost)
        }
    },

    generateUniqueId() {
        return Math.floor(Date.now() / 1000) + Math.random().toString(36).substr(2, 16);
    },

    dealDamage(from_unit, to_unit) {
        if (from_unit.cooldown_attack > 0) {
            from_unit.cooldown_attack--;
        } else {
            to_unit.health -= from_unit.damage;
            from_unit.cooldown_attack = from_unit.default_cooldown_attack;
        }
    },

    removeBusyWith(id) {
        for (let unit_id in game.stage.units) {
            let unit = game.stage.units[unit_id];
            for(let index in unit.fighting_with) {
                let busy_unit_id = unit.fighting_with[index];
                if (id === busy_unit_id) {
                    let i = unit.fighting_with.indexOf(busy_unit_id);
                    if(i !== -1) {
                        game.stage.units[unit_id].fighting_with.splice(i, 1);
                    }
                }
            }
            // ???
            for(let index in unit.shooting_with) {
                let shooted_unit_id = unit.shooting_with[index];
                if (id === shooted_unit_id) {
                    game.stage.units[unit_id].shooting_with = [];
                }
            }
        }
    },

    clearObject() {
        game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    }
};

function addAr(game) {
    let archer = new Archer();
    archer.player = 2;
    archer.src = archer.src2;
    archer.x = 900;
    archer.default_speed = -archer.default_speed;
    archer.attack_distance = -archer.attack_distance;
    game.hireUnit(archer);
}
function addKn(game) {
    let knight = new Knight();
    knight.player = 2;
    knight.src = knight.src2;
    knight.x = 900;
    knight.default_speed = -knight.default_speed;
    game.hireUnit(knight);
}
function addWc(game) {
    let woodcutter = new Woodcutter();
    woodcutter.player = 2;
    woodcutter.src = woodcutter.src2;
    woodcutter.x = 900;
    woodcutter.default_speed = -woodcutter.default_speed;
    game.hireUnit(woodcutter);
}
window.addEventListener("load", () => {
    game.init();

    document.querySelector('.one_player_btn').onclick = () => {
        game.startGame('onePlayer');

        document.getElementById("menu").style.display = "none";
        document.getElementById("player-two-buttons").style.display = "none";
        document.querySelector(".buttons").style.display = "block";
    };

    document.querySelector('.two_player_btn').onclick = () => {
        game.startGame('twoPlayers');
        document.getElementById("player-two-buttons").style.display = "initial";
        document.getElementById("menu").style.display = "none";
        document.querySelector(".buttons").style.display = "block";
    };
    /*
    document.querySelectorAll('.restart-button').onclick = () => {
        game.restartGame();
    };
    */
    document.getElementById('button_01').onclick = () => {
        let woodcutter = new Woodcutter();
        woodcutter.path = [];
        game.hireUnit(woodcutter);
    };

    document.getElementById('button_02').onclick = () => {
        game.hireUnit(new Knight());
    };

    document.getElementById('button_03').onclick = () => {
        game.hireUnit(new Archer());
    };

    document.getElementById('button_04').onclick = () => {
        if (game.isPlayerTwo) {
            socket.emit('player-cmd', 'a');
            return;
        }
        addWc(game);
    };

    document.getElementById('button_05').onclick = () => {
        if (game.isPlayerTwo) {
            socket.emit('player-cmd', 's');
            return;
        }
        addKn(game);
    };

    document.getElementById('button_06').onclick = () => {
        if (game.isPlayerTwo) {
            socket.emit('player-cmd', 'd');
            return;
        }
        addAr(game);
    };

    document.addEventListener("keydown", (event) => {
        if (event.which === 81) {
            document.getElementById('button_01').click();
        }
        if (event.which === 87) {
            document.getElementById('button_02').click();
        }
        if (event.which === 69) {
            document.getElementById('button_03').click();
        }
        if (event.which === 65) {
            document.getElementById('button_04').click();
        }
        if (event.which === 83) {
            document.getElementById('button_05').click();
        }
        if (event.which === 68) {
            document.getElementById('button_06').click();
        }
    });
});
