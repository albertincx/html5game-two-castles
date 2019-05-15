class Unit {
    id = game.generateUniqueId();
    player = 1;
    src = false;
    x = 50;
    y = 340;
    health = 100;
    width = 100;
    height = 100;
    damage = 0;
    fighting_with = [];
    shooting_with = [];
    default_speed = 0;
    default_health = 0;
    damage_to_all = false;
    is_busy = false;

    constructor() {
        this.draw();
    }

    draw() {
        if (this.src) {
            const unit = new Image();
            unit.src = this.src;
            if (!this.fighting_with.length && !this.shooting_with.length && !this.is_busy) {
                if (!this.fighting_with.length) { //this.x < 900 &&
                    this.x = this.x + this.default_speed;
                    this.t += this.t_param;
                    this.y = this.y_param_a + (Math.sin(this.t) * this.y_param_b);
                }
            }
            game.context.drawImage(unit, this.x, this.y, this.width, this.height);
            this.drawScrollbar();
        }
    }

    drawScrollbar() {
        const width = this.default_health,
            height = 7,
            current_width = width * this.health / this.default_health,
            pos_offset = (this.default_health - this.width) / 2;

        // Draw the background
        game.context.fillStyle = '#ca0d0d';
        game.context.fillRect(this.x - pos_offset, this.y - 15, width, height);
        // Draw the fill
        game.context.fillStyle = '#57d83a';
        game.context.fillRect(this.x - pos_offset, this.y - 15, current_width, height);
        game.context.fillStyle = '#000';
    }

    action() {
        const self = this;
        for (const unit_id in game.stage.units) {
            const unit = game.stage.units[unit_id];
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
            // Deal damage to only one enemy
            if (!self.damage_to_all) {
                const fighting_with_id = self.fighting_with[0];
                game.dealDamage(self, game.stage.units[fighting_with_id]);
            }

            for (let index  in self.fighting_with) {
                const unit_id = self.fighting_with[index];
                const busy_unit = game.stage.units[unit_id];

                // Take damage from each enemy
                game.dealDamage(busy_unit, self);

                // Deal damage to all
                if (self.damage_to_all) {
                    game.dealDamage(self, busy_unit);
                }

                if (self.health <= 0) {
                    busy_unit.speed = -busy_unit.default_speed;
                    busy_unit.fighting_with.shift();
                    delete game.stage.units[self.id];
                    game.removeBusyWith(self.id);
                    game.changeGold(busy_unit.player, self.win_price);
                }

                if (busy_unit.health <= 0) {
                    self.fighting_with.shift();
                    self.speed = self.default_speed;
                    delete game.stage.units[busy_unit.id];
                    game.removeBusyWith(busy_unit.id);

                    game.changeGold(self.player, busy_unit.win_price);
                }
            }
        }

        // Collision with castles
        if (this.player === 1 && this.x - (this.width / 2) > (game.castle2.x - game.castle2.width / 2)) {
            game.castle2.health -= this.damage;
            game.removeBusyWith(this.id);
            delete game.stage.units[this.id];
            //game.addScore(1, 10);
        }

        if (this.player === 2 && this.x + (this.width / 2) < (game.castle.x + game.castle.width / 2)) {
            game.castle.health -= this.damage;
            game.removeBusyWith(this.id);
            delete game.stage.units[this.id];
            //game.addScore(2, 10);
        }
    }
    specialAction() {}
}

class Knight extends Unit {
    src = 'images/units/knight.png';
    src2 = 'images/units/knight2.png';
    width = 37;
    height = 50;
    default_health = 50;
    health = this.default_health;
    damage = 10;
    default_speed = 1.5;
    default_cooldown_attack = 100;
    cost = 20;
    win_price = 5;
    t = 0.005;
    t_param = 0.0055;
    y_param_a = 330 + Math.floor(Math.random() * 15) + 1;
    y_param_b = 55;
}

class Woodcutter extends Unit{
    src = "images/units/woodcutter.png";
    src2 = 'images/units/woodcutter2.png';
    src_carry = "images/units/woodcutter_carry.png";
    width = 29;
    height = 40;
    default_health = 10;
    health = this.default_health;
    damage = 3;
    default_speed = 2;
    default_cooldown_attack = 50;
    cost = 10;
    speed_wearing = this.default_speed/2;
    speed_cutting = 100;
    path = [];
    win_price = 1;
    tree_gold = 30;
    t = 0.01;
    t_param = 0.007;
    y_param_a = 350 + Math.floor(Math.random() * 15) + 1;
    y_param_b = 55;
    is_busy = false;

    action() {
        const self = this;
        if (!self.is_busy) {
            // Twice slower
            this.path.push({'x': this.x, 'y': this.y});
            this.path.push({'x': this.x, 'y': this.y});

            if (game.stage.trees.length) {
                game.stage.trees.forEach( (tree, index) => {
                    if (tree.has_grown &&
                        self.x + self.width / 2 > tree.x - tree.width / 2  &&
                        self.x + self.width / 2 < tree.x + tree.width / 2
                    ) {
                        self.is_busy = true;
                        self.damage = 0;
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
                    game.removeBusyWith(self.id);
                    delete game.stage.units[self.id];
                    game.changeGold(self.player, self.tree_gold);
                }
            }
        }
    }
}

class Archer extends Unit {
    src = "images/units/archer.png";
    src2 = "images/units/archer2.png";
    width = 35;
    height = 55;
    default_health = 25;
    health = this.default_health;
    damage = 5;
    default_speed = 1.2;
    attack_distance = 300;
    default_cooldown_attack = 500;
    cost = 30;
    win_price = 5;
    t = 0.01;
    t_param = 0.0045;
    y_param_a = 340 + Math.floor(Math.random() * 15) + 1;
    y_param_b = 35;
    is_shoot = false;

    specialAction() {
        const self = this;

        for (const unit_id in game.stage.units) {
            const unit = game.stage.units[unit_id];
            // Check for collision with other units
            let is_far = self.x + self.attack_distance > unit.x;
            if (self.player === 2) {
                is_far = self.x + self.attack_distance < unit.x;
            }
            if (
                is_far &&
                self.player !== unit.player &&
                 !self.shooting_with.length
            ) {
                self.shooting_with.push(unit.id);
                self.speed = 0;
            } else {
                self.speed = self.default_speed;
            }

            if (self.shooting_with.length) {
                const unit = game.stage.units[self.shooting_with[0]];
                self.shoot(unit);
            }
        }
    }
    shoot(to_unit) {
        if (this.cooldown_attack > 0) {
            if (!this.is_shoot) {
                game.stage.arrows.push(new Arrow(this.x, this.y, to_unit.x, to_unit.y, this.player, this.damage, to_unit.id));
                this.is_shoot = true;
            }
            this.cooldown_attack--;
        } else {
            this.cooldown_attack = this.default_cooldown_attack;
            this.is_shoot = false;
        }
    }
}
