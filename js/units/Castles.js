class Castle {
    x = 1;
    y = 210;
    width = 130;
    height = 193;
    default_health = 100;
    health = this.default_health;
    gold = 0;
    src = "images/castle.png";
    coin_src = "images/coin.png";
    coin_width = 29;
    coin_height = 35;
    player = 1;

    constructor() {
        this.draw();
    }

    draw() {
        if (this.health <= 0 && !game.isGameOver) {
            game.gameOver(this.player);
        }
        let castle = new Image();
        castle.src = this.src;
        game.context.drawImage(castle, this.x, this.y, this.width, this.height);

        // Coins
        game.context.font = "20pt Arial";
        game.context.fillText(this.gold, this.x + 50, 37);

        let coin = new Image();
        coin.src = this.coin_src;
        game.context.drawImage(coin, this.x + 15, 10, this.coin_width, this.coin_height);

        this.drawScrollbar();
    }

    drawScrollbar () {
        if (this.health < 0) {
            this.health = 0;
        }

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

class Castle2 extends Castle {
    x = 890;
    height = 192;
    src = "images/castle2.png";
    player = 2;
}