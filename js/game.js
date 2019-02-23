let game = {
    settings: {
        width: 1024,
        height: 568,
        trees_max: 3
    },
    stage: {
        units: [],
        trees: [],
        clouds: [],
        castle: false,
        castle2: false
    },
    running: true,
    // Start initializing objects, preloading assets and display start screen
    init: function() {
        // Get handler for game canvas and context
        game.canvas = document.getElementById("gamecanvas");
        game.context = game.canvas.getContext("2d");

        game.stage.clouds.push(new Cloud(600, 50, 255, 76, 0.05, 'images/cloud_03.png'));
        game.stage.clouds.push(new Cloud(0, 100, 178, 75, 0.1, 'images/cloud_01.png'));
        game.stage.clouds.push(new Cloud(400, 200, 173, 52, 0.2, 'images/cloud_02.png'));

        // Castles
        game.castle = new Castle();
        game.castle2 = new Castle2();

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
            // Добавить логику по y в зависимости от x, что дерево не висело в воздухе и не опускалось вниз. И разные деревья
            tree.draw(tree);
        });

        // Units
        for (const id in game.stage.units) {
            let unit = game.stage.units[id];
            unit.draw();
            unit.action(unit.id);
            unit.specialAction(unit.id)
        }

        if (game.stage.trees.length < game.settings.trees_max) {
            game.growTree();
        }

        if (game.running) {
            requestAnimationFrame(game.drawingLoop);
        }

        game.context.fillText("Total units: " + Object.keys(game.stage.units).length, 330, 30);
    },
    growTree: function () {
        let tree = new Tree();
        this.stage.trees.push(tree);
    },
    drawClouds: function() {

    },
    addScore(player, point) {
        if (player === 1) {
            game.castle.score += parseInt(point);
        } else {
            game.castle2.score += parseInt(point);
        }
    }
};

window.addEventListener("load", function() {
    game.init();
    document.getElementById('button_01').onclick = function() {
        let woodcutter = new Woodcutter();
        woodcutter.path = [];
        game.stage.units[woodcutter.id] = woodcutter;
    };

    document.getElementById('button_02').onclick = function() {
        let knight = new Knight();
        game.stage.units[knight.id] = knight;
    };

    document.getElementById('button_03').onclick = function() {
        let archer = new Archer();
        game.stage.units[archer.id] = archer;
    };

    document.getElementById('button_04').onclick = function() {
        let woodcutter = new Woodcutter();
        woodcutter.path = [];
        woodcutter.x = 900;
        woodcutter.player = 2;
        woodcutter.speed = -woodcutter.speed;
        woodcutter.default_speed = -woodcutter.default_speed;
        woodcutter.fighting_with = [];
        woodcutter.src = 'images/woodcutter2.png';

        game.stage.units[woodcutter.id] = woodcutter;
        console.log(game.stage.units);
    };

    document.getElementById('button_05').onclick = function() {
        let knight = new Knight();
        knight.x = 900;
        knight.player = 2;
        knight.speed = -knight.speed;
        knight.default_speed = -knight.default_speed;
        knight.fighting_with = [];
        knight.src = 'images/knight2.png';
        game.stage.units[knight.id] = knight;
    };

    document.getElementById('button_06').onclick = function() {
        let archer = new Archer();
        archer.x = 900;
        archer.src = "images/archer2.png";
        archer.player = 2;
        archer.speed = -archer.speed;
        archer.default_speed = -archer.default_speed;
        archer.shooting_with = [];
        archer.attack_distance = -archer.attack_distance;
        game.stage.units[archer.id] = archer;
    };

    document.addEventListener("keydown", function(event) {
        console.log(event.which);
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