//import directions from input to check the move direction
import { directions } from '/EmojiWar/js/input.js'
import { hitDetected } from '/EmojiWar/js/methods.js'
import Enemy from '/EmojiWar/js/enemy.js';
import { getRandomInt, resetIfOutOfScreen, updateLayout } from '/EmojiWar/js/methods.js'
export var playerCharacters = [
    {
        size: 120,
        speed: 50,
        character: document.getElementById("character1"),
        shootingSound: document.getElementById("shoot1"),
        hurtSound: document.getElementById("maleHurt"),
        health: 50,
        projectileInfo: {
            size: 20,
            speed: 120,
            character: document.getElementById("projectile1")
        },
    },
    {
        size: 120,
        speed: 70,
        character: document.getElementById("character2"),
        shootingSound: document.getElementById("shoot1"),
        hurtSound: document.getElementById("femaleHurt"),
        health: 80,
        projectileInfo: {
            size: 30,
            speed: 140,
            character: document.getElementById("projectile2")
        }
    },
    {
        size: 120,

        speed: 80,
        character: document.getElementById("character3"),
        shootingSound: document.getElementById("shoot1"),
        hurtSound: document.getElementById("maleHurt"),
        health: 120,
        projectileInfo: {
            size: 30,
            speed: 200,
            character: document.getElementById("projectile3")
        }
    }
]

//player class
export default class Player {
    constructor(playerIndex, gameScreen) {
        this.characterInfo = playerCharacters[playerIndex];
        this.winFlag = -1;
        this.size = this.characterInfo.size;
        this.speed = this.characterInfo.speed;
        this.position = {
            x: gameScreen.width / 2 - this.size / 2,
            y: gameScreen.height / 2 - this.size / 2
        };
        this.gameWidth = gameScreen.width;
        this.gameHeight = gameScreen.height;
        this.character = this.characterInfo.character;
        this.shootingSound = this.characterInfo.shootingSound;
        this.rotation;
        this.scale = 1;
        this.health = this.characterInfo.health;
        this.projectileIndex = this.characterInfo.projectileIndex;
        this.layout = {
            left: this.position.x - this.size / 2,
            right: this.position.x + this.size / 2,
            top: this.position.y - this.size / 2,
            bottom: this.position.y + this.size / 2
        }
        this.hurtSound = this.characterInfo.hurtSound
        this.wave = 1;
    }
    shoot(isShooting) {
        if (isShooting) {
            //shoot effect
            this.shootingSound.play();
            this.scale = 1.08;
        }
        //generation of projectile should be here
        //VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
    }
    //draw method that will be executed in the game loop after move() method to update the position
    draw(context, mousePosition) {
        let scaleX = 1;
        if (this.position.x > mousePosition.x) {
            //getting the angle to the mouse position
            this.rotation = Math.atan2(mousePosition.x - this.position.x, -(mousePosition.y - this.position.y)) + 1.4;
            //mirorr the character horizontally when it's flipped 
            scaleX = -1;
        }
        else {
            this.rotation = Math.atan2(mousePosition.x - this.position.x, -(mousePosition.y - this.position.y)) - 1.32;
        }
        //save other context objects to not be affected by the rotation
        context.save();
        //draw the over context in the x,y position
        context.translate(this.position.x, this.position.y)
        //rotate the draw by the calculated angle
        context.rotate(this.rotation);
        //scale effect on the contect before draw the image
        context.scale(scaleX * this.scale, this.scale);
        //draw the image over the drawn area to be rotated by the same value
        context.drawImage(this.character, -this.character.style.width - this.size / 2, -this.character.style.height - this.size / 2, this.size, this.size)
        //restore the other context objects
        context.restore()
    }
    isHit(enemies) {
        for (let i = 0; i < enemies.length; i++) {
            //enemy touches the player
            if (hitDetected(enemies[i], this)) {
                if (this.isPlayerDead(enemies[i].health)) { // decrease player health check if dead
                    //Lost Msg & set the winFlag to Pause the Game
                    this.winFlag = 0; //you've lost
                }
                else {
                    this.hurtSound.play();
                    enemies.splice(i, 1);
                    if (enemies.length == 0) {
                        this.wave++;
                        if (this.wave > 10) {
                            //Win Msg & set the winFlag to Pause the Game
                            this.winFlag = 1;   
                        }
                        else {
                            $("#waveNo").html(this.wave);
                            for (let i = 0; i < this.wave; i++) {
                                enemies.push(new Enemy(getRandomInt(0, 3), gameScreen))
                            }
                        }
                    }
                }
            }
        }
    }

    //move method that will be executed in the game loop before the draw() method
    move(held_directions, deltaTime) {
        if (!deltaTime) return;
        let heldDirections = [held_directions[0], held_directions[1]];
        //up_right
        if (heldDirections.includes(directions.up) && heldDirections.includes(directions.right)) {
            this.position.y -= this.speed / deltaTime;
            this.position.x += this.speed / deltaTime;
        }
        //up_left
        else if (heldDirections.includes(directions.up) && heldDirections.includes(directions.left)) {
            this.position.y -= this.speed / deltaTime;
            this.position.x -= this.speed / deltaTime;
        }
        //down_right
        else if (heldDirections.includes(directions.down) && heldDirections.includes(directions.right)) {
            this.position.y += this.speed / deltaTime;
            this.position.x += this.speed / deltaTime;
        }
        //down_left
        else if (heldDirections.includes(directions.down) && heldDirections.includes(directions.left)) {
            this.position.y += this.speed / deltaTime;
            this.position.x -= this.speed / deltaTime;
        }
        //up_down_left_right
        else {
            if (heldDirections[0] === directions.right) { this.position.x += this.speed / deltaTime; }
            if (heldDirections[0] === directions.left) { this.position.x -= this.speed / deltaTime; }
            if (heldDirections[0] === directions.down) { this.position.y += this.speed / deltaTime; }
            if (heldDirections[0] === directions.up) { this.position.y -= this.speed / deltaTime; }
        }
        //set the illusion of a wall for a translated canvas img
        resetIfOutOfScreen(this)
        //update player character layout
        updateLayout(this)

    }
    isPlayerDead(value) {

        this.health -= value;
        let percentage = Math.round((this.health / this.characterInfo.health) * 100);
        if (percentage > 0) {
            $("#health").html("%" + percentage).width(percentage + "%")
            return false;
        }
        else {
            $("#health").html("%0").width('0')
            return true;
        }
    }
}
