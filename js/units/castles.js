class Castles {
    constructor() {
        this.x = 1;
        this.y = 210;
        this.width = 130;
        this.height = 193;
        this.default_health = 100;
        this.health = this.default_health;
        this.score = 0;
        this.src = "images/castle.png";

        this.draw();
    }

    draw() {
        let castle = new Image();
        castle.src = this.src;
        game.context.drawImage(castle, this.x, this.y, this.width, this.height);

        game.context.font = "20pt Arial";
        //game.context.fillText("health: " + this.health, this.x, this.y - 50);
        game.context.fillText("score: " + this.score, this.x + 10, 30);
        this.drawScrollbar();
    }

    drawScrollbar () {
        let width = 110,
            height = 15,
            current_width = width * this.health / this.default_health;

        // Draw the background
        game.context.fillStyle = '#ca0d0d';
        game.context.fillRect(this.x + 10, this.y - 30, width, height);
        // Draw the fill
        game.context.fillStyle = '#57d83a';
        game.context.fillRect(this.x + 10, this.y - 30, current_width, height);
        game.context.fillStyle = '#000';
    }
}

class Castle extends Castles {
    constructor() {
        super();
    }
}

class Castle2 extends Castles {
    constructor() {
        super();
        this.x = 890;
        this.height = 192;
        this.src = "images/castle2.png";
    }
}