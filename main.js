class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.character = null;
        this.pages = [];
        this.gameWidth = this.container.offsetWidth;
        this.gameHeight = this.container.offsetHeight;
        this.createScenario();
        this.addEvents();
    }

    createScenario() {
        this.character = new Character(this.gameWidth, this.gameHeight);
        this.container.appendChild(this.character.element);
        
        for(let i = 0; i < 5; i++) {
            const page = new Page(this.gameWidth, this.gameHeight);
            this.pages.push(page);
            this.container.appendChild(page.element);
        }
    }

    addEvents() {
        window.addEventListener("keydown", (e) => this.character.move(e));
        window.addEventListener("resize", () => this.handleResize());
        this.checkColisiones();
    }

    handleResize() {
        this.gameWidth = this.container.offsetWidth;
        this.gameHeight = this.container.offsetHeight;
    }

    checkColisiones() {
        setInterval(() => {
            // Iterar en reversa para evitar problemas de índice
            for(let i = this.pages.length - 1; i >= 0; i--) {
                if(this.character.colisionaCon(this.pages[i])) {
                    this.container.removeChild(this.pages[i].element);
                    this.pages.splice(i, 1);
                }
            }
        }, 100);
    }
}

// Aplicar herencia 

class GameObject {
    constructor(x, y, width, height, className){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = document.createElement("div");
        this.element.classList.add(className);
        this.element.style.position = "absolute";
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    collisionWith(objeto) {
        return (
            this.x < objeto.x + objeto.width &&
            this.x + this.width > objeto.x &&
            this.y < objeto.y + objeto.height &&
            this.y + this.height > objeto.y
        );
    }
}


class Character extends GameObject {
    constructor(gameWidth, gameHeight) { // Agregar parámetros
        const initialX = (gameWidth - 50) / 2;
        const initialY = (gameHeight - 50) / 2;
        super(initialX, initialY, 50, 50, "character");
        this.speed = 10;
        this.saltando = false;
        this.imagen = document.createElement("img");
        this.imagen.style.width = "100%";
        this.imagen.style.height = "100%";
        this.imagenNormal = "./media/frontal.png";
        this.imagenJump = "./media/salto.png";
        this.imagen.src = this.imagenNormal;
        this.element.appendChild(this.imagen);
    }

    move(evento) {
        if(evento.key === "ArrowRight") {
            this.x += this.speed;
        } else if(evento.key === "ArrowLeft") {
            this.x -= this.speed;
        } else if(evento.key === "ArrowUp") {
            this.jump();
        }
        this.updatePosition();
    }

    jump() {
        if(this.jumping) return;
        this.jumping = true;
        this.imagen.src = this.imagenJump;
        
        const maxHeight = this.y - 100;
        const saltoInterval = setInterval(() => {
            if(this.y > maxHeight) {
                this.y -= 10;
            } else {
                clearInterval(saltoInterval);
                this.fall();
            }
            this.updatePosition();
        }, 20);
    }

    fall() {
        const gravedadInterval = setInterval(() => {
            if(this.y < 300) {
                this.y += 10;
            } else {
                clearInterval(gravedadInterval);
                this.imagen.src = this.imagenNormal;
                this.jumping = false;
            }
            this.updatePosition();
        }, 20);
    }
}

class Page extends GameObject {
    constructor(gameWidth, gameHeight) {
        const width = 30;
        const height = 30;
        super(
            Math.random() * (gameWidth - width),
            Math.random() * (gameHeight - height),
            width,
            height,
            "page"
        );
        this.element.style.backgroundColor = "gold";
        this.element.style.borderRadius = "50%";
        this.element.style.boxShadow = "0 0 10px 2px rgba(255, 223, 0, 0.8)";
    }
}

const game = new Game();