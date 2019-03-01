class Arrow {
    p0 = {"x": 100, "y": 340}; // start
    p1 = {"x": 180, "y": 50}; // middle 1
    p2 = {"x": 180, "y": 50}; // middle 2
    p3 = {"x": 300, "y": 340}; // end
    t = 1;
    speed = -0.02;
    player = 1;
    src = 'images/arrow.png';
    src2 = 'images/arrow2.png';

    constructor(x_start, y_start, x_end, y_end, player = 1, damage, unit_id) {

        this.player = player;
        this.damage = damage;
        this.unit_id = unit_id;

        this.p0.x = x_start;
        this.p0.y = y_start;
        this.p3.x = x_end;
        this.p3.y = y_end;

        //this.p1.x = this.p2.x = x_start + 50;
        this.p1.x = this.p2.x = x_start + (x_end - x_start)/2;

        if (this.player === 2) {
            this.p1.x = this.p2.x = x_start + (x_end - x_start)/2;
        }

        this.p1.y = this.p2.y = y_start - 40;//y_end/2;
    }

    draw() {
        let at = 1 - this.t;
        let green1x = this.p0.x * this.t + this.p1.x * at;
        let green1y = this.p0.y * this.t + this.p1.y * at;
        let green2x = this.p1.x * this.t + this.p2.x * at;
        let green2y = this.p1.y * this.t + this.p2.y * at;
        let green3x = this.p2.x * this.t + this.p3.x * at;
        let green3y = this.p2.y * this.t + this.p3.y * at;
        let blue1x = green1x * this.t + green2x * at;
        let blue1y = green1y * this.t + green2y * at;
        let blue2x = green2x * this.t + green3x * at;
        let blue2y = green2y * this.t + green3y * at;
        let finalx = blue1x * this.t + blue2x * at;
        let finaly = blue1y * this.t + blue2y * at;

        //game.context.clearRect(0, 0, game.context.width, game.context.height);
        //game.context.beginPath();
        //game.context.arc(finalx, finaly, 30, 0, 2 * Math.PI, false);
        //game.context.fillStyle = 'red';
        //game.context.fill();
        //game.context.closePath();

        game.context.save();


        const arrow = new Image();
        arrow.src = this.src;
        if (this.player === 2) {
            arrow.src = this.src2;
            //let angleInDegrees = 10;
            //game.context.rotate(angleInDegrees*Math.PI / 180);
        }

        game.context.drawImage(arrow, finalx, finaly, 30, 5);
        game.context.restore();
        this.t += this.speed;
        //console.log(this.t);
        //if (this.t > 1 || this.t < 0) this.speed *= -1;

    }
}