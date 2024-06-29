// GLOBAL VARIABLE - mendeklarasikan variable pembantu
var X_POSITION;
var Y_POSITION;
var relativeSize;
var gameStarted = false;
var snd_touch = null;
var music_play = null;
var score = null;
let enemy = null;

// GLOBAL VARIABLE - mendeklarasikan dan inisialisasi variabel 'layoutSize'
var layoutSize = { 'w': 1024, 'h': 768 };

class sceneMenu extends Phaser.Scene {
   constructor() {
      super({
         key: "sceneMenu",
         pack: {
            files: [
               { type: 'image', key: 'logo', url: 'assets/gamedev_smkn1ngk.png' }
            ]
         }
      });
   }

   preload() {
      this.load.path = 'assets/';

      this.load.image('logo', 'gamedev_smkn1ngk.png');
      this.load.image([
         { key: 'background', url: 'BG.jpg' },
         { key: 'coin_panel', url: 'PanelCoin.png' },
         { key: 'skor_panel', url: 'PanelSkor.png' },
         { key: 'btn_play', url: 'ButtonPlay.png' },
         { key: 'btn_home', url: 'ButtonHome.png' },
         { key: 'ground', url: 'tile40.png' },
         { key: 'float', url: 'float32.png' },
         { key: 'gameover', url: 'GameOver.png' },
         { key: 'title', url: 'Title.png' },
      ]);

      // this.load.spritesheet('chara', 'CharaSpriteAnim.png', { frameWidth: 44.8, frameHeight: 93 });
      this.load.spritesheet('chara', 'pirate64x40.png', { frameWidth: 64, frameHeight: 32 });
      this.load.spritesheet('enemy1', 'shark34x30.png', { frameWidth: 34, frameHeight: 30 });
      this.load.spritesheet('enemy2', 'seashell48x38.png', { frameWidth: 48, frameHeight: 38 });
      this.load.spritesheet('enemy3', 'crabby72x32.png', { frameWidth: 72, frameHeight: 32 });
      this.load.spritesheet('coin', 'chestanim64x35.png', { frameWidth: 64, frameHeight: 35 });

      this.load.audio([
         { key: 'snd_coin', url: ['koin.ogg', 'koin.mp3'] },
         { key: 'snd_lose', url: ['kalah.ogg', 'kalah.mp3'] },
         { key: 'snd_jump', url: ['lompat.ogg', 'lompat.mp3'] },
         { key: 'snd_leveling', url: ['ganti_level.ogg', 'ganti_level.mp3'] },
         { key: 'snd_walk', url: ['langkah.ogg', 'langkah.mp3'] },
         { key: 'snd_touch', url: ['touch.ogg', 'touch.mp3'] },
         { key: 'music_play', url: ['music_play.mp3'] },
      ]);

      // sekedar tambahan untuk efek progress bar
      for (var i = 0; i < 2000; i++) {
         this.load.image('logo' + i, 'gamedev_smkn1ngk.png');
      }

      var width = game.canvas.width;
      var height = game.canvas.height;

      var progressBar = this.add.graphics();

      var progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.7);
      // progressBox.fillRect(x, y, w, h);
      progressBox.fillRect(width / 2 - 190, height / 2 + 40, 383, 20);

      var logoImage = this.add.image(width / 2, height / 2, 'logo');

      var percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
         font: '10px monospace',
         fill: '#ffffff'
      });
      percentText.setOrigin(0.5, 0.5);

      this.load.on('progress', function (value) {
         percentText.setText(parseInt(value * 100) + '%');
         progressBar.clear();
         progressBar.fillStyle(0xffffff, 1);
         // progressBar.fillRect(250, 280, 300 * value, 30);
         progressBar.fillRect(width / 2 - 180, height / 2 + 45, 373 * value, 10);
      });

      // this.load.on('fileprogress', function (file) {
      //   assetText.setText('Loading asset: ' + file.key);
      // });

      this.load.on('complete', function () {
         progressBar.destroy();
         progressBox.destroy();
         percentText.destroy();
         logoImage.destroy();
      });

   }

   create() {
      X_POSITION = {
         'LEFT': 0,
         'CENTER': game.canvas.width / 2,
         'RIGHT': game.canvas.width
      };

      Y_POSITION = {
         'TOP': 0,
         'CENTER': game.canvas.height / 2,
         'BOTTOM': game.canvas.height
      };

      relativeSize = {
         'w': ((game.canvas.width - layoutSize.w) / 2),
         'h': ((game.canvas.height - layoutSize.h) / 2)
      };

      var activeScene = this;

      // menambahkan background
      this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'background').setScale(1.2);

      var title = activeScene.add.image(X_POSITION.CENTER, Y_POSITION.CENTER - 50, 'title');
      title.setDepth(20);

      // menambahkan backdrop darkenLayer
      var darkenLayer = this.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, game.canvas.width, game.canvas.height, 0x000000);
      darkenLayer.setDepth(10);
      darkenLayer.alpha = 0.25;

      // penampung musik
      snd_touch = this.sound.add('snd_touch');
      music_play = this.sound.add('music_play');
      music_play.setVolume(0.3);
      music_play.loop = true;

      // menambahkan buttonPlay di layar permainan
      var buttonPlay = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER + 100, 'btn_play');
      buttonPlay.setDepth(10);
      buttonPlay.setInteractive();

      // deteksi event pada buttonPlay
      buttonPlay.on('pointerdown', function (pointer) { this.setTint(0x5a5a5a) });
      buttonPlay.on('pointerout', function (pointer) { this.clearTint(); });
      buttonPlay.on('pointerup', function (pointer) {
         this.clearTint();

         // menghilangkan buttonPlay
         activeScene.tweens.add({
            targets: this,
            ease: 'Back.In',
            duration: 250,
            scaleX: 0,
            scaleY: 0
         });

         // menghilangkan darkenLayer
         activeScene.tweens.add({
            delay: 150,
            targets: darkenLayer,
            duration: 250,
            alpha: 0,
            onComplete: function () {
               // mengubah nilai variabel gameStarted menjadi 'true'
               gameStarted = true;

               // menuju scenePlay
               activeScene.scene.start('scenePlay');
            }
         });



         // mainkan sound fx snd_touch
         snd_touch.play();

         // mainkan musik
         music_play.play();
      });

   }

   update() { }
}

class scenePlay extends Phaser.Scene {
   constructor() {
      super({ key: "scenePlay" });
   }

   preload() { }

   create() {
      var activeScene = this;

      // variabel untuk menampung level permainan
      this.currentLevel = 1;

      // menambahkan background
      this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'background').setScale(1.2);

      // menambahkan backdrop darkenLayer
      var darkenLayer = this.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, game.canvas.width, game.canvas.height, 0x000000);
      darkenLayer.setDepth(10);
      darkenLayer.alpha = 0;

      // menambahkan coinPanel
      var coinPanel = this.add.image(X_POSITION.CENTER, 30, 'coin_panel');
      coinPanel.setDepth(10);
      // menambahkan coinText untuk menampilkan perolehan koin
      var coinText = this.add.text(X_POSITION.CENTER, 30, '0', {
         fontFamily: 'Verdana, Arial',
         fontSize: '24px',
         color: '#898989'
      });
      coinText.setOrigin(0.5);
      coinText.setDepth(10);

      // membuat variabel sprite untuk ground
      let groundTemp = this.add.image(0, 0, 'ground').setVisible(false);
      let floatTemp = this.add.image(0, 0, 'float').setVisible(false);

      // membuat variabel untuk menampung ukuran tiap gambar pijakan
      let groundSize = { 'width': groundTemp.width, 'height': groundTemp.height };
      let floatSize = { 'width': floatTemp.width, 'height': floatTemp.height };

      // membuat grup physic pijakan (platform)
      var platforms = this.physics.add.staticGroup();

      // menambahkan grup physic untuk enemies
      var enemies = this.physics.add.group();

      //membuat enemies berpijak pada platform
      this.physics.add.collider(enemies, platforms);

      // menambahkan sprite karakter dengan physics ke dalam game
      this.player = this.physics.add.sprite(100, 500, 'chara');

      this.player.setGravity(0, 800); //mengatur gravitasi menjadi '800' agar lebih cepat jatuh
      this.player.setBounce(0.2); //memantulkan player ketika jatuh
      this.player.setScale(2.0);
      this.player.setSize(20, 30);

      this.physics.add.collider(this.player, platforms); // menambahkan deteksi tubrukan antara karakter dengan grup pijakan
      this.player.setCollideWorldBounds(true); // mengaktifkan proteksi agar player tidak bisa ke luar layar

      // mendeteksi input tombol arah keyboard
      this.cursors = this.input.keyboard.createCursorKeys();

      // penampung sound fx
      this.snd_coin = this.sound.add('snd_coin');
      this.snd_jump = this.sound.add('snd_jump');
      this.snd_leveling = this.sound.add('snd_leveling');
      this.snd_lose = this.sound.add('snd_lose');

      // sound fx walking
      this.snd_walk = this.sound.add('snd_walk');
      this.snd_walk.loop = true;
      this.snd_walk.setVolume(0);
      this.snd_walk.play();

      // menambahkan animasi berlari ke kiri
      this.anims.create({
         key: 'walk',
         frames: this.anims.generateFrameNumbers('chara', { start: 5, end: 10 }),
         frameRate: 15,
      });

      this.anims.create({
         key: 'chest',
         frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 9 }),
         frameRate: 10,
         repeat: -1
      });

      // menambahkan animasi berhenti (stop)
      // frames: [{ key: 'chara', frame: 4 }],
      this.anims.create({
         key: 'idle',
         frames: this.anims.generateFrameNumbers('chara', { start: 0, end: 4 }),
         frameRate: 10,
      });

      this.anims.create({
         key: 'jump',
         frames: this.anims.generateFrameNumbers('chara', { start: 11, end: 13 }),
         frameRate: 6,
      });

      // animasi untuk enemy1
      this.anims.create({
         key: 'idle1',
         frames: this.anims.generateFrameNumbers('enemy1', { start: 0, end: 7 }),
         frameRate: 8,
         repeat: -1
      });

      this.anims.create({
         key: 'attack1',
         frames: this.anims.generateFrameNumbers('enemy1', { start: 8, end: 12 }),
         frameRate: 10,
      });

      // animasi untuk enemy2
      this.anims.create({
         key: 'idle2',
         frames: [{ key: 'enemy2', frame: 0 }],
         frameRate: 8,
      });

      this.anims.create({
         key: 'attack2',
         frames: this.anims.generateFrameNumbers('enemy2', { start: 1, end: 6 }),
         frameRate: 12,
      });

      // animasi untuk enemy3
      this.anims.create({
         key: 'idle3',
         frames: this.anims.generateFrameNumbers('enemy3', { start: 0, end: 8 }),
         frameRate: 9,
         repeat: -1
      });

      this.anims.create({
         key: 'attack3',
         frames: this.anims.generateFrameNumbers('enemy3', { start: 9, end: 12 }),
         frameRate: 10,
      });

      // menambahkan koin
      var coins = this.physics.add.group({
         key: 'coin',
         repeat: 9,
         setXY: { x: 60 + relativeSize.w, y: -100, stepX: 100 }
      });

      // koin memantul
      coins.children.iterate(function (child) {
         child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
         child.anims.play('chest', true);
      });

      // koin berpijak
      this.physics.add.collider(coins, platforms);

      // penampung koin
      var countCoin = 0;

      // fungsi transisi ganti level
      var newLevelTransition = function () {
         var levelTransitionText = activeScene.add.text(X_POSITION.CENTER, Y_POSITION.CENTER, 'Level ' + activeScene.currentLevel, {
            fontFamily: 'Verdana, Arial',
            fontSize: '40px',
            color: '#ffffff'
         });
         levelTransitionText.setOrigin(0.5);
         levelTransitionText.setDepth(10);
         levelTransitionText.alpha = 0;

         activeScene.tweens.add({
            targets: levelTransitionText,
            duration: 1000,
            alpha: 1,
            yoyo: true,
            onComplete: function () {
               levelTransitionText.destroy();
            }
         });

         // animasi menampilkan background darken layer
         activeScene.tweens.add({
            delay: 2000,
            targets: darkenLayer,
            duration: 250,
            alpha: 0,
            onComplete: function () {
               activeScene.gameStarted = true;
               activeScene.physics.resume();
            }
         });
      }

      // fungsi deteksi tubrukan dengan koin
      var collectCoin = function (player, coin) {
         countCoin += 10;
         coinText.setText(countCoin);
         coin.disableBody(true, true);

         // mainkan sound fx
         activeScene.snd_coin.play();

         // aktifkan partikel ketika koin ditabrak
         activeScene.emiterCoin.setPosition(coin.x, coin.y);
         activeScene.emiterCoin.explode();

         // cek jika semua koin sudah dikumpulkan
         if (coins.countActive(true) === 0) {
            //naikkan level 1 tingkat


            activeScene.snd_walk.setVolume(0);
            activeScene.gameStarted = false;
            activeScene.physics.pause();

            this.player.anims.play('idle');

            activeScene.tweens.add({
               targets: darkenLayer,
               duration: 250,
               alpha: 1,
               onComplete: function () {
                  activeScene.currentLevel++;
                  // membuat pola pijakan setelah layar hitam hilang
                  prepareWorld();

                  // mainkan sound efek
                  activeScene.snd_leveling.play();

                  // menjalankan animasi transisi ganti level
                  newLevelTransition();
               }
            });
         }
      }

      // deteksi ketika player overlap koin
      this.physics.add.overlap(this.player, coins, collectCoin, null, this);

      // tambahkan obyek partikel koin
      let partikelCoin = this.add.particles('coin');

      // membuat emiter koin
      this.emiterCoin = partikelCoin.createEmitter({
         speed: { min: 150, max: 250 },
         gravity: { x: 0, y: 200 },
         scale: { start: 1, end: 0 },
         lifespan: { min: 200, max: 300 },
         quantity: { min: 5, max: 15 },
      });

      this.emiterCoin.setPosition(-100, -100);
      this.emiterCoin.explode();

      // fungsi seleksi level permainan
      var prepareWorld = function () {
         // bersihkan pola platform setiap kali ganti level
         platforms.clear(true, true);

         // buat koin baru
         coins.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.3));
            child.enableBody(true, child.x, -100, true, true);
         });

         // membuat pijakan di bagian bawah layar
         platforms.create(X_POSITION.CENTER - groundSize.width * 5, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER - groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER - groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER - groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER - groundSize.width, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER + groundSize.width, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER + groundSize.width * 2, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER + groundSize.width * 3, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER + groundSize.width * 4, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');
         platforms.create(X_POSITION.CENTER + groundSize.width * 5, Y_POSITION.BOTTOM - groundSize.height / 2, 'ground');

         if (activeScene.currentLevel == 1) {
            // membuat pijakan untuk level 1
            platforms.create(floatTemp.width / 2 + relativeSize.w, 384, 'float');
            platforms.create(400 + relativeSize.w, 424, 'float');
            platforms.create(1024 - floatTemp.width / 2 + relativeSize.w, 480, 'float');
            platforms.create(600 + relativeSize.w, 584, 'float');
         } else if (activeScene.currentLevel == 2) {
            // membuat pijakan untuk level 2
            platforms.create(80 + relativeSize.w, 284, 'float');
            platforms.create(230 + relativeSize.w, 184, 'float');
            platforms.create(390 + relativeSize.w, 284, 'float');
            platforms.create(990 + relativeSize.w, 360, 'float');
            platforms.create(620 + relativeSize.w, 430, 'float');
            platforms.create(900 + relativeSize.w, 570, 'float');
         } else {
            // membuat pijakan untuk level selain 1 dan 2
            platforms.create(80 + relativeSize.w, 230, 'float');
            platforms.create(230 + relativeSize.w, 230, 'float');
            platforms.create(1040 + relativeSize.w, 280, 'float');
            platforms.create(600 + relativeSize.w, 340, 'float');
            platforms.create(400 + relativeSize.w, 420, 'float');
            platforms.create(930 + relativeSize.w, 430, 'float');
            platforms.create(820 + relativeSize.w, 570, 'float');
            platforms.create(512 + relativeSize.w, 590, 'float');
            platforms.create(0 + relativeSize.w, 570, 'float');
         }

         if (activeScene.currentLevel > 1) {
            // menentukan posisi horizontal munculnya enemy
            var x = Phaser.Math.Between(100, game.canvas.width - 100);

            // membuat enemy baru
            activeScene.nomer = Phaser.Math.Between(1, 3);
            activeScene.nmEnemy = 'enemy' + activeScene.nomer;
            activeScene.enemy = enemies.create(x, -100, activeScene.nmEnemy);
            activeScene.enemy.setSize(20, 20);
            activeScene.enemy.setScale(2.0);
            activeScene.enemy.setCollideWorldBounds(true);

            activeScene.enemy.setBounce(1);
            activeScene.enemy.setVelocity(Phaser.Math.Between(-200, 200), 20);
            activeScene.enemy.allowGravity = false;
         }
      };

      prepareWorld();

      // fungsi untuk tubrukan enemy dengan player
      var hitEnemy = function (player, enemy) {
         this.physics.pause();   //menghentikan semua gerak physics
         this.player.setTint(0xff0000);   //membuat player berwarna merah

         // hentikan sound efek
         this.snd_walk.stop();
         music_play.stop();
         activeScene.snd_lose.play();

         // tampilkan teks gameover
         activeScene.gameStarted = false;
         score = countCoin;

         let highScore = localStorage['skorTerbaik'] || 0;
         if (score > highScore) { localStorage['skorTerbaik'] = score; }

         activeScene.scene.start('sceneGameOver');
      }

      // deteksi ketika player overlap enemy
      this.physics.add.collider(this.player, enemies, hitEnemy, null, this);

   }

   update() {
      // pengecekan kondisi game dimulai atau belum
      if (!gameStarted) {
         return;
      }

      if (this.currentLevel > 1) {
         if (this.enemy.x > this.player.x) {
            this.enemy.setFlipX(false);
         } else {
            this.enemy.setFlipX(true);
         }

         this.enemy.anims.play('attack' + this.nomer, true);
      }

      // tombol arah kanan ditekan
      if (this.cursors.right.isDown) {
         // menggerakkan karakter ke arah kanan ketika tombol arah kanan ditekan
         this.player.setFlipX(false);
         this.player.setVelocityX(200);

         if (this.player.body.touching.down) {
            this.player.anims.play('walk', true);
            this.snd_walk.setVolume(1);
         } else {
            this.player.anims.play('jump', true);
            this.snd_walk.setVolume(0);
         }

      } else if (this.cursors.left.isDown) {
         // menggerakkan karakter ke arah kiri ketika tombol arah kiri ditekan
         this.player.setVelocityX(-200);
         this.player.setFlipX(true);

         if (this.player.body.touching.down) {
            // meng-animasikan karakter berlari ke kiri
            this.player.anims.play('walk', true);
            this.snd_walk.setVolume(1);
         } else {
            this.player.anims.play('jump', true);
            this.snd_walk.setVolume(0);
         }

      } else {
         // menghentikan gerakan karakter ketika tombol arah kanan/kiri tidak ditekan
         this.player.setVelocityX(0);
         this.player.anims.play('idle', true);
         this.snd_walk.setVolume(0);
      }

      // mendeteksi tombol arah atas ditekan
      if (this.cursors.up.isDown && this.player.body.touching.down) {
         this.player.setVelocityY(-650);
         this.player.anims.play('jump', true);
         this.snd_jump.play();
      }

      if (!this.player.body.touching.down) {
         this.player.anims.play('jump', true);
      }

   }
}

class sceneGameOver extends Phaser.Scene {
   constructor() {
      super({ key: "sceneGameOver" });
   }

   preload() { }

   create() {
      var activeScene = this;

      // variabel untuk status game
      this.gameStarted = false;

      // menambahkan background
      this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'background');

      // menambahkan backdrop darkenLayer
      var darkenLayer = this.add.rectangle(X_POSITION.CENTER, Y_POSITION.CENTER, game.canvas.width, game.canvas.height, 0x000000);
      darkenLayer.setDepth(10);
      darkenLayer.alpha = 0.75;

      var gameover = activeScene.add.image(X_POSITION.CENTER, Y_POSITION.CENTER - 200, 'gameover');
      gameover.setDepth(10);

      // menambahkan panelSkor
      var panelSkor = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'skor_panel');
      panelSkor.setDepth(10);
      // menambahkan skorText untuk menampilkan perolehan koin
      var skorText = this.add.text(X_POSITION.CENTER - 100, Y_POSITION.CENTER + 8, score, {
         fontFamily: 'Verdana, Arial',
         fontSize: '24px',
         color: '#898989'
      });
      skorText.setOrigin(0.5);
      skorText.setDepth(10);

      let highScore = localStorage['skorTerbaik'] || 0;
      var highscoreText = this.add.text(X_POSITION.CENTER + 100, Y_POSITION.CENTER + 8, highScore, {
         fontFamily: 'Verdana, Arial',
         fontSize: '24px',
         color: '#898989'
      });
      highscoreText.setOrigin(0.5);
      highscoreText.setDepth(10);

      // menambahkan buttonPlay di layar permainan
      var buttonPlay = this.add.image(X_POSITION.CENTER - 50, Y_POSITION.CENTER + 125, 'btn_play');
      buttonPlay.setDepth(10);
      buttonPlay.setInteractive();
      buttonPlay.setScale(0.5);

      // menambahkan buttonPlay di layar permainan
      var buttonHome = this.add.image(X_POSITION.CENTER + 50, Y_POSITION.CENTER + 125, 'btn_home');
      buttonHome.setDepth(10);
      buttonHome.setInteractive();
      buttonHome.setScale(0.5);

      // deteksi event pada buttonPlay
      buttonPlay.on('pointerdown', function (pointer) { this.setTint(0x5a5a5a) });
      buttonPlay.on('pointerout', function (pointer) { this.clearTint(); });
      buttonPlay.on('pointerup', function (pointer) {
         this.clearTint();

         // menghilangkan buttonPlay
         activeScene.tweens.add({
            targets: this,
            ease: 'Back.In',
            duration: 250,
            scaleX: 0,
            scaleY: 0
         });

         // menghilangkan darkenLayer
         activeScene.tweens.add({
            delay: 150,
            targets: darkenLayer,
            duration: 250,
            alpha: 0,
            onComplete: function () {
               activeScene.gameStarted = true;
               activeScene.scene.start('scenePlay');
            }
         });

         snd_touch.play();
         music_play.play();
      });

      // deteksi event pada buttonHome
      buttonHome.on('pointerdown', function (pointer) { this.setTint(0x5a5a5a) });
      buttonHome.on('pointerout', function (pointer) { this.clearTint(); });
      buttonHome.on('pointerup', function (pointer) {
         this.clearTint();

         // menghilangkan buttonHome
         activeScene.tweens.add({
            targets: this,
            ease: 'Back.In',
            duration: 250,
            scaleX: 0,
            scaleY: 0
         });

         // menghilangkan darkenLayer
         activeScene.tweens.add({
            delay: 150,
            targets: darkenLayer,
            duration: 250,
            alpha: 0,
            onComplete: function () {
               activeScene.gameStarted = false;
               activeScene.scene.start('sceneMenu');
            }
         });

         snd_touch.play();
         music_play.stop();
      });

   }

   update() { }
}

// konfigurasi phaser
const config = {
   type: Phaser.AUTO,
   width: layoutSize.w,
   height: layoutSize.h,
   physics: {
      default: 'arcade',
      arcade: {
         debug: false,
         gravity: { y: 200 }
      }
   },
   scene: [sceneMenu, scenePlay, sceneGameOver]
};

const game = new Phaser.Game(config);