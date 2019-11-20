class Tree {
    constructor(x, y = 430, width = 70, height = 100, growth_rate = 1, time_to_grow = 100, has_grown = false) {
        this.src = 'images/tree.png';
        this.x = x || Math.floor(Math.random() * 650) + 190;
        this.y = y;
        this.width = width;
        this.height = height;
        this.has_grown = has_grown;
        this.time_to_grow = time_to_grow;
        this.growth_rate = growth_rate;
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
