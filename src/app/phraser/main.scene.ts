// src/app/phaser/main.scene.ts
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private enemy!: Phaser.GameObjects.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private solidTiles = new Set<number>([1]);
    private tileSize = 16;
    private isGameOver = false;
    private hasWon = false;
    private gameOverText!: Phaser.GameObjects.Text;
    private winText!: Phaser.GameObjects.Text;
    private goalTilePos = { x: 18, y: 1 };
    private stepSound!: Phaser.Sound.BaseSound;
    private gameOverSound!: Phaser.Sound.BaseSound;
    private winSound!: Phaser.Sound.BaseSound;

    private level: number[][] = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.spritesheet('tiles', 'assets/tiles.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('hero', 'assets/hero.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.audio('step', 'assets/sounds/step.wav');
        this.load.audio('gameover', 'assets/sounds/gameover.wav');
        this.load.audio('win', 'assets/sounds/win.wav');
    }

    create() {
        const wallTile = 428;
        const floorTile = 302;
        const goalTileIndex = 452;

        this.level.forEach((row, y) => {
            row.forEach((cell, x) => {
                const tileIndex = cell === 1 ? wallTile : floorTile;
                this.add.sprite(x * this.tileSize, y * this.tileSize, 'tiles', tileIndex).setOrigin(0);
            });
        });

        // Draw goal (stairs)
        this.add.sprite(this.goalTilePos.x * this.tileSize, this.goalTilePos.y * this.tileSize, 'tiles', goalTileIndex).setOrigin(0);

        this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 2 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNumbers('hero', { start: 3, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNumbers('hero', { start: 6, end: 8 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('hero', { start: 9, end: 11 }), frameRate: 8, repeat: -1 });

        this.player = this.add.sprite(32, 32, 'hero', 0).setOrigin(0);
        this.enemy = this.add.sprite(224, 64, 'hero', 6).setOrigin(0);
        this.stepSound = this.sound.add('step');
        this.gameOverSound = this.sound.add('gameover');
        this.winSound = this.sound.add('win');

        this.cursors = this.input?.keyboard?.createCursorKeys()!;

        this.time.addEvent({
            delay: 400,
            loop: true,
            callback: this.chasePlayer,
            callbackScope: this
        });
    }

    override update() {
        if (this.isGameOver || this.hasWon) {
            if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('R'), 100)) {
                this.scene.restart();
            }
            return;
        }

        const speed = 1.5;
        const moving = { x: 0, y: 0 };

        if (this.cursors.left?.isDown) {
            moving.x = -speed;
            this.player.anims.play('walk-left', true);
        } else if (this.cursors.right?.isDown) {
            moving.x = speed;
            this.player.anims.play('walk-right', true);
        } else if (this.cursors.up?.isDown) {
            moving.y = -speed;
            this.player.anims.play('walk-up', true);
        } else if (this.cursors.down?.isDown) {
            moving.y = speed;
            this.player.anims.play('walk-down', true);
        } else {
            this.player.anims.stop();
        }

        const nextX = this.player.x + moving.x;
        const nextY = this.player.y + moving.y;

        if (!this.isBlocked(nextX, this.player.y)) {
            this.player.x = nextX;
            this.stepSound.play();
        }
        if (!this.isBlocked(this.player.x, nextY)) {
            this.player.y = nextY;
            this.stepSound.play();
        }

        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y) < this.tileSize / 2) {
            this.handleGameOver();
        }

        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);

        if (playerTileX === this.goalTilePos.x && playerTileY === this.goalTilePos.y) {
            this.handleWin();
        }
    }

    private isBlocked(x: number, y: number): boolean {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        if (row < 0 || row >= this.level.length || col < 0 || col >= this.level[0].length) {
            return true;
        }
        return this.solidTiles.has(this.level[row][col]);
    }

    private chasePlayer() {
        if (this.isGameOver || this.hasWon) return;

        const playerTileX = Math.floor(this.player.x / this.tileSize);
        const playerTileY = Math.floor(this.player.y / this.tileSize);
        const enemyTileX = Math.floor(this.enemy.x / this.tileSize);
        const enemyTileY = Math.floor(this.enemy.y / this.tileSize);

        const dx = playerTileX - enemyTileX;
        const dy = playerTileY - enemyTileY;

        let stepX = 0;
        let stepY = 0;

        if (Math.abs(dx) > Math.abs(dy)) {
            stepX = Math.sign(dx);
        } else {
            stepY = Math.sign(dy);
        }

        const nextX = (enemyTileX + stepX) * this.tileSize;
        const nextY = (enemyTileY + stepY) * this.tileSize;

        if (!this.isBlocked(nextX, nextY)) {
            this.enemy.x = nextX;
            this.enemy.y = nextY;
        }
    }

    private handleGameOver() {
        this.isGameOver = true;
        this.gameOverSound.play();
        this.gameOverText = this.add.text(50, 40, '💀 GAME OVER\nPress R to restart', {
            fontSize: '12px',
            color: '#ff4444',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 8 },
            align: 'center'
        }).setScrollFactor(0).setDepth(10);
    }

    private handleWin() {
        this.hasWon = true;
        this.winSound.play();
        this.winText = this.add.text(40, 40, '🎉 YOU WIN!\nPress R to restart', {
            fontSize: '12px',
            color: '#00ff88',
            backgroundColor: '#000000aa',
            padding: { x: 10, y: 8 },
            align: 'center'
        }).setScrollFactor(0).setDepth(10);
    }
}
