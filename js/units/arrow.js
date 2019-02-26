class Arrow {
    id = game.generateUniqueId();
    t = 0.005;
    t_param = 0.12;
    y_param_a = 390;
    y_param_b = 65;
    src = 'images/arrow.png';
    y_start = false;
    iter = 0;

    constructor(x = 50, y = 290, player = 1) {
        this.x = x;
        this.y = y;
        this.x_start = x;
        this.player = player;

        //this.prev_y = y;
        //this.draw();
    }

    draw() {

        this.t -= this.t_param;
        this.y = this.y_param_a + (Math.sin(this.t) * this.y_param_b);
        if (this.player === 1) {
            this.x = this.x + 10;
        } else {
            this.x = this.x - 10;
        }


        if (!this.y_start) {
            this.y_start = this.y;
        } else {
            this.iter++;
        }

        let unit = new Image();
        unit.src = this.src;
        game.context.save();
        //game.context.rotate(Math.PI/110);
        game.context.drawImage(unit, this.x, this.y, 30, 5);
        //game.context.restore();

    }
}