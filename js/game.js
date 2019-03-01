let game = {
    arrow: false,
    settings: {
        trees_max: 3,
        init_gold: 200,
        idle_gold: 5,
        idle_gold_cooldown_default: 250,
        idle_gold_cooldown: 250,
    },
    stage: {
        units: [],
        arrows: [],
        trees: [],
        clouds: [],
        castle: false,
        castle2: false
    },
    running: true,
    // Start initializing objects, preloading assets and display start screen
    init: function() {
        this.arrow = new Arrow();
        // Get handler for game canvas and context
        game.canvas = document.getElementById("gamecanvas");
        game.context = game.canvas.getContext("2d");

        game.stage.clouds.push(new Cloud(600, 50, 255, 76, 0.05, 'images/cloud_03.png'));
        game.stage.clouds.push(new Cloud(0, 100, 178, 75, 0.1, 'images/cloud_01.png'));
        game.stage.clouds.push(new Cloud(400, 200, 173, 52, 0.2, 'images/cloud_02.png'));

        // Castles
        game.castle = new Castle();
        game.castle2 = new Castle2();

        // Init gold
        game.changeGold(1, game.settings.init_gold);
        game.changeGold(2, game.settings.init_gold);

        game.drawingLoop();
    },
    clearObject: function () {
        game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
    },
    drawingLoop: function() {
        game.clearObject();

        // Clouds
        game.stage.clouds.forEach(function(cloud, i) {
            cloud.draw(cloud);
        });

        // Castles
        game.castle.draw();
        game.castle2.draw();

        // Trees
        game.stage.trees.forEach(function(tree, i) {
            tree.draw(tree);
        });

        // Units
        for (const id in game.stage.units) {
            const unit = game.stage.units[id];
            unit.draw();
            unit.action(unit.id);
            unit.specialAction(unit.id)
        }

        // Arrows
        game.stage.arrows.forEach(function(arrow, i) {
            let unit = game.stage.units[arrow.unit_id];
            if (typeof unit == "undefined") {
                console.log('EXIT');
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
            game.growTree();
        }

        if (game.running) {
            requestAnimationFrame(game.drawingLoop);
        }

        --game.settings.idle_gold_cooldown;
        if (game.settings.idle_gold_cooldown <= 0) {
            game.settings.idle_gold_cooldown = game.settings.idle_gold_cooldown_default;
            game.changeGold(1, game.settings.idle_gold);
            game.changeGold(2, game.settings.idle_gold);
        }

        game.context.fillText("Total units: " + Object.keys(game.stage.units).length, 330, 30);
    },
    growTree: function () {
        let tree = new Tree();
        this.stage.trees.push(tree);
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
        console.log('Not enough gold');
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
};

window.addEventListener("load", () => {
    game.init();
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
        let woodcutter = new Woodcutter();
        woodcutter.player = 2;
        woodcutter.src = woodcutter.src2;
        woodcutter.x = 900;
        woodcutter.default_speed = -woodcutter.default_speed;
        game.hireUnit(woodcutter);
    };

    document.getElementById('button_05').onclick = () => {
        let knight = new Knight();
        knight.player = 2;
        knight.src = knight.src2;
        knight.x = 900;
        knight.default_speed = -knight.default_speed;
        game.hireUnit(knight);
    };

    document.getElementById('button_06').onclick = () => {
        let archer = new Archer();
        archer.player = 2;
        archer.src = archer.src2;
        archer.x = 900;
        archer.default_speed = -archer.default_speed;
        archer.attack_distance = -archer.attack_distance;
        game.hireUnit(archer);
    };

    document.addEventListener("keydown", (event) => {
        if(event.which === 81) {
            document.getElementById('button_01').click();
        }
        if(event.which === 87) {
            document.getElementById('button_02').click();
        }
        if(event.which === 69) {
            document.getElementById('button_03').click();
        }
        if(event.which === 65) {
            document.getElementById('button_04').click();
        }
        if(event.which === 83) {
            document.getElementById('button_05').click();
        }
        if(event.which === 68) {
            document.getElementById('button_06').click();
        }
    });
});