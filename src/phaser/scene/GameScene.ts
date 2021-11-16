import Player from '../object/Player';

export default class GameScene extends Phaser.Scene {
  private platforms: Phaser.GameObjects.Image[];

  private player: Player;

  constructor() {
    super({
      key: 'GameScene',
    });
  }

  preload() {
    this.load.image(
      'garuda',
      'https://cdn.jsdelivr.net/gh/Miscavel/Garuda-Jump@master/public/assets/garuda.png'
    );
    this.load.image(
      'atom',
      'https://cdn.jsdelivr.net/gh/Miscavel/Garuda-Jump@master/public/assets/atom.png'
    );
    this.load.image(
      'platform',
      'https://cdn.jsdelivr.net/gh/Miscavel/Garuda-Jump@master/public/assets/platform.png'
    );
  }

  create() {
    const { width: screenWidth, height: screenHeight } = this.cameras.main;
    const centerOfScreenX = screenWidth * 0.5;
    const bottomOfScreenY = screenHeight;

    this.setupBlocks();

    this.player = new Player(this, centerOfScreenX, bottomOfScreenY - 40);
    this.add.existing(this.player);

    this.physics.add.overlap(
      this.platforms,
      this.player,
      (platformBody, playerBody) => {
        this.player.jump();
      }
    );

    this.input.keyboard.off(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      this.onKeyDown,
      this
    );
    this.input.keyboard.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      this.onKeyDown,
      this
    );

    this.input.keyboard.off(
      Phaser.Input.Keyboard.Events.ANY_KEY_UP,
      this.onKeyUp,
      this
    );
    this.input.keyboard.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_UP,
      this.onKeyUp,
      this
    );
  }

  private onKeyDown(event: KeyboardEvent) {
    const { code } = event;
    switch (code) {
      case 'ArrowLeft': {
        this.player.tiltLeft();
        break;
      }

      case 'ArrowRight': {
        this.player.tiltRight();
        break;
      }
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    const { code } = event;
    switch (code) {
      case 'ArrowLeft': {
        this.player.resetAccelerationX();
        break;
      }

      case 'ArrowRight': {
        this.player.resetAccelerationX();
        break;
      }
    }
  }

  private setupBlocks() {
    const { width: screenWidth, height: screenHeight } = this.cameras.main;
    const centerOfScreenX = screenWidth * 0.5;
    const bottomOfScreenY = screenHeight;

    this.platforms = new Array<Phaser.GameObjects.Image>();

    for (let i = 0; i < 20; i++) {
      if (i === 0) {
        const basePlatform = this.physics.add
          .image(centerOfScreenX, bottomOfScreenY, 'platform')
          .setDisplaySize(screenWidth * 2, 16);
        this.platforms.push(basePlatform);
      } else {
        const platform = this.physics.add.image(
          Phaser.Math.RND.between(36, screenWidth - 36),
          bottomOfScreenY - 75 * i,
          'platform'
        );
        platform.setDisplaySize(72, 16);
        this.platforms.push(platform);
      }
    }
  }

  private updateCameraCenter() {
    this.cameras.main.centerOn(
      this.cameras.main.midPoint.x,
      Math.min(this.cameras.main.midPoint.y, this.player.y)
    );
  }

  public keepPlayerWithinScreen() {
    const { width: screenWidth } = this.cameras.main;
    if (this.player.x < -100) {
      this.player.x = screenWidth + 100;
    } else if (this.player.x > screenWidth + 100) {
      this.player.x = -100;
    }
  }

  private isTransformOutOfScreen(
    transform: Phaser.GameObjects.Components.Transform
  ) {
    const { height: screenHeight, midPoint } = this.cameras.main;

    return transform.y > midPoint.y + screenHeight * 0.55;
  }

  public recyclePlatforms() {
    const lowestPlatform = this.platforms[0];
    const highestPlatform = this.platforms[this.platforms.length - 1];

    if (this.isTransformOutOfScreen(lowestPlatform)) {
      lowestPlatform.setY(highestPlatform.y - 75);
      lowestPlatform.setDisplaySize(72, 16);
      this.platforms.push(this.platforms.shift());
    }
  }

  private checkGameOver() {
    if (this.isTransformOutOfScreen(this.player)) {
      this.scene.start('GameScene');
    }
  }

  update() {
    this.updateCameraCenter();
    this.keepPlayerWithinScreen();
    this.recyclePlatforms();
    this.checkGameOver();
  }
}
