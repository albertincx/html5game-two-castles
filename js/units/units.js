class Unit {
    constructor() {
        this.id = this.generateUniqueId();
        this.src = false;
        this.x = 50;
        this.y = 340;
        this.player = 1;
        this.fighting_with = [];
        this.shooting_with = [];
        this.default_speed = 0;
        this.health = 0;
        this.damage_to_all = false;
        this.path = [];
        this.is_busy = false;

        this.draw();
    }

    draw() {
        if (this.src) {
            let unit = new Image();
            unit.src = this.src;
            if (!this.fighting_with.length && !this.shooting_with.length && !this.is_busy) {
                if (!this.fighting_with.length) { //this.x < 900 &&
                    this.x = parseInt(this.x) + this.default_speed;
                    this.t += this.t_param;
                    this.y = this.y_param_a + (Math.sin(this.t) * this.y_param_b);
                }
            }
            game.context.drawImage(unit, this.x, this.y, this.width, this.height);
            game.context.fillText(this.health, this.x + 20, this.y - 5);
        }
    }

    dealDamage(from_unit, to_unit) {
        if (from_unit.cooldown_attack > 0) {
            from_unit.cooldown_attack--;
        } else {
            to_unit.health -= from_unit.damage;
            from_unit.cooldown_attack = from_unit.default_cooldown_attack;
        }
    }

    generateUniqueId() {
        return Math.floor(Date.now() / 1000) + Math.random().toString(36).substr(2, 16);
    }

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
    }

    action(i) {
        // Collision with unit
        let self = this;
        // Each unit on stage
        for (const unit_id in game.stage.units) {
            let unit = game.stage.units[unit_id];
            // Check for collision with other units
            if (
                self.x+self.width/2 > unit.x &&
                self.player !== unit.player &&
                self.player === 1
            ) {
                self.speed = 0;
                unit.speed = 0;
                if (!unit.fighting_with.includes(self.id)) {
                    unit.fighting_with.push(self.id);
                }
                if (!self.fighting_with.includes(unit.id)) {
                    self.fighting_with.push(unit.id);
                }
            }
        }

        if (self.fighting_with.length) {
            // Deal damage to only one
            if (!self.damage_to_all) {
                let fighting_with_id = self.fighting_with[0];
                this.dealDamage(self, game.stage.units[fighting_with_id]);
            }

            for (let index  in self.fighting_with) {
                let unit_id = self.fighting_with[index];
                let busy_unit = game.stage.units[unit_id];

                // Take damage from each enemy
                this.dealDamage(busy_unit, self);

                // Deal damage to all
                if (self.damage_to_all) {
                    this.dealDamage(self, busy_unit);
                }

                if (self.health <= 0) {
                    busy_unit.speed = -busy_unit.default_speed;
                    busy_unit.fighting_with.shift();
                    delete game.stage.units[self.id];
                    this.removeBusyWith(self.id);

                    game.addScore(busy_unit.player, self.win_price);
                }

                if (busy_unit.health <= 0) { // typeof busy_unit.health !== "undefined" &&
                    self.fighting_with.shift(); // remove
                    self.speed = self.default_speed;
                    delete game.stage.units[busy_unit.id];
                    this.removeBusyWith(busy_unit.id);

                    game.addScore(self.player, busy_unit.win_price);
                }
            }
        }

        // Collision with castles
        if (this.player === 1 && this.x - (this.width / 2) > (game.castle2.x - game.castle2.width / 2)) {
            console.log('Collision by unit: knight with castle 2: '+game.stage.units[this.id].health);
            game.castle2.health -= this.damage;
            this.removeBusyWith(this.id);
            delete game.stage.units[this.id];

            //game.addScore(1, 10);
        }

        if (this.player === 2 && this.x + (this.width / 2) < (game.castle.x + game.castle.width / 2)) {
            console.log('Collision by unit: knight with castle 1: '+game.stage.units[this.id].health);
            game.castle.health -= this.damage;
            this.removeBusyWith(this.id);
            delete game.stage.units[this.id];

            //game.addScore(2, 10);
        }
    }
    specialAction(i) {

    }
}

class Knight extends Unit {
    constructor() {
        super();

        this.width = 100;
        this.height = 75;
        this.speed = 15;
        this.default_speed = 15;
        this.damage = 5;
        this.win_price = 5;
        this.health = 50;
        this.t = 0.01;
        this.t_param = 0.055;
        this.y_param_a = 330;
        this.y_param_b = 65;

        this.src = 'images/knight.png';
    }
}

class Woodcutter extends Unit{
    constructor() {
        super();

        this.src = "images/woodcutter.png";
        this.src_carry = "images/woodcutter_carry.png";
        this.id = this.generateUniqueId();
        this.width = 50;
        this.height = 50;
        this.default_speed = 2;
        this.speed = this.default_speed;
        this.speed_wearing = this.default_speed/2;
        this.speed_cutting = 100;
        this.damage = 1;
        this.health = 10;

        this.path = [];

        this.win_price = 1;
        this.tree_score = 15;

        this.t = 0.01;
        this.t_param = 0.007;
        this.y_param_a = 350 + Math.floor(Math.random() * 15) + 1  ;
        this.y_param_b = 55;

        this.is_busy = false;
    }

    action(i) {
        super.action(i);

        let self = this;

        if (!self.is_busy) {
            // Twice slower
            this.path.push({'x': this.x, 'y': this.y});
            this.path.push({'x': this.x, 'y': this.y});

            if (game.stage.trees.length) {
                game.stage.trees.forEach(function (tree, index) {
                    if (tree.has_grown &&
                        self.x + self.width / 2 > tree.x - tree.width / 2  &&
                        self.x + self.width / 2 < tree.x + tree.width / 2
                    ) {
                        self.is_busy = true;
                        self.damage = 0;
                        //console.log('collision with tree');
                        game.stage.trees.splice(index, 1);
                        self.path.reverse();
                    }
                });
            }
        } else {
            // Busy
            if (self.speed_cutting > 0) {
                --self.speed_cutting;
            } else {
                const path = self.path.shift();
                this.src = this.src_carry;
                if (path) {
                    self.x = path.x;
                    self.y = path.y;
                } else {
                    // Returned to castle
                    this.removeBusyWith(self.id);
                    delete game.stage.units[self.id];
                    game.addScore(self.player, self.tree_score);
                }
            }
        }
    }
}

class Archer extends Unit {
    constructor() {
        super();

        this.src = "images/archer.png";
        this.width = 100;
        this.height = 75;
        this.speed = 3;
        this.default_speed = 3;
        this.damage = 5;
        this.attack_distance = 500;
        this.cooldown_attack = 200;
        this.default_cooldown_attack = 200;
        this.win_price = 5;
        this.health = 30;
        this.t = 0.01;
        this.t_param = 0.01;
        this.y_param_a = 330;
        this.y_param_b = 65;
    }

    specialAction(i) {
        let self = this;

        for (const unit_id in game.stage.units) {
            let unit = game.stage.units[unit_id];
            // Check for collision with other units
            let is_far = self.x+self.attack_distance > unit.x;
            if (self.player === 2) {
                is_far = self.x+self.attack_distance < unit.x;
            }
            if (
                is_far &&
                self.player !== unit.player &&
                //self.player === 1 &&
                 !self.shooting_with.length
            ) {
                self.shooting_with.push(unit.id);
                self.speed = 0;
            } else {
                self.speed = self.default_speed;
            }

            if (self.shooting_with.length) {
                const unit = game.stage.units[self.shooting_with[0]];
                self.shoot(self, unit);
                if (unit.health <= 0) {
                    this.removeBusyWith(unit.id);
                    delete game.stage.units[unit.id];
                    self.shooting_with = [];
                    self.speed = self.default_speed;
                }
            }
        }
    }
    shoot(from_unit, to_unit) {
        let x = to_unit.x;
        let y = to_unit.y;
        if (from_unit.cooldown_attack > 0) {
            from_unit.cooldown_attack--;
           x += from_unit.cooldown_attack/to_unit.x*10;
        } else {
            to_unit.health -= from_unit.damage;
            from_unit.cooldown_attack = from_unit.default_cooldown_attack;
            x = to_unit.x;
            y = to_unit.y;
        }

        //const arrow = new Image();
        //arrow.src = "images/arrow.png";
        //game.context.drawImage(arrow, x, y, 50, 20);
    }
}

class Tree {
    constructor() {
        this.src = 'images/tree.png';
        this.x = Math.floor(Math.random() * 650) + 190;
        this.y = 430;
        this.width = 80;
        this.height = 100;
        this.has_grown = false;
        this.time_to_grow = 100;
        this.growth_rate = 1;
    }

    draw(tree) {
        let width = tree.width,
            height = tree.height;
        if (tree.time_to_grow > 0 && !tree.has_grown) {
            //console.log('test');
            width = width/100 * (100 - tree.time_to_grow);
            height = height/100 * (100 - tree.time_to_grow);
            tree.time_to_grow -= tree.growth_rate;
            tree.y -= 1;

        } else {
            tree.has_grown = true;
        }

        let trees = new Image();
        trees.src = tree.src;
        game.context.drawImage(trees, tree.x, tree.y, width, height);
    }
}

class Cloud {
    constructor(x, y, width, height, speed, src) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.src = src;
        this.width = width;
        this.height = height;

        this.draw();
    }

    draw() {
        const cloud = new Image();
        cloud.src = this.src;
        this.x += this.speed;
        game.context.drawImage(cloud, this.x, this.y, this.width, this.height);

        if (this.x > game.canvas.width) {
            this.x = -this.width;
        }
    }
}