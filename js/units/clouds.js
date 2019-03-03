class Clouds {
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