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