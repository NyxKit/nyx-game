console.log('BlackHole')

/*

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true, // Enable to see physics
            gravity: { y: 0 }
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let player, blackHole;

function preload() {
    this.load.image('player', 'player.png');  // Replace with your sprite
    this.load.image('blackHole', 'blackhole.png'); // Replace with your sprite
}

function create() {
    player = this.physics.add.sprite(400, 500, 'player');
    blackHole = this.add.sprite(400, 300, 'blackHole');

    player.setCollideWorldBounds(true);
    player.setDamping(true).setDrag(0.98); // Adds slight friction to stabilize movement
}

function update() {
    const speed = 200;
    let velocity = new Phaser.Math.Vector2(0, 0);

    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) velocity.y = -1;
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) velocity.y = 1;
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) velocity.x = -1;
    if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) velocity.x = 1;

    velocity.normalize().scale(speed);

    applyBlackHoleEffect(player, velocity, blackHole, 500);
}

function applyBlackHoleEffect(player, velocity, blackHole, pullForce) {
    let playerPos = new Phaser.Math.Vector2(player.x, player.y);
    let holePos = new Phaser.Math.Vector2(blackHole.x, blackHole.y);

    // Vector from player to black hole (pull direction)
    let pullDirection = holePos.clone().subtract(playerPos).normalize();

    // Perpendicular force (orbital force)
    let orbitalDirection = new Phaser.Math.Vector2(-pullDirection.y, pullDirection.x); // 90° rotation
    let orbitStrength = 100; // Control how strong the orbit effect is

    // Dot product to check movement direction
    let dot = pullDirection.dot(velocity.clone().normalize());

    if (dot > 0) {
        velocity.scale(2); // Moving toward the black hole → speed up
    } else if (dot < 0) {
        velocity.scale(0.5); // Moving away → slow down
    }

    // Apply black hole attraction force
    let attraction = pullDirection.scale(pullForce / Phaser.Math.Distance.Between(player.x, player.y, blackHole.x, blackHole.y));

    // Apply orbital force
    let orbitForce = orbitalDirection.scale(orbitStrength / Phaser.Math.Distance.Between(player.x, player.y, blackHole.x, blackHole.y));

    velocity.add(attraction).add(orbitForce);

    player.setVelocity(velocity.x, velocity.y);
}

*/
