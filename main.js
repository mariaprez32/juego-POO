class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.character = null;
        this.pages = [];
        this.score = 0;
        this.necessaryPages = 10;
        this.setTime = Date.now();
        this.scoreElement = document.querySelector("#score span");
        this.timerElement = document.querySelector("#timer span");
        this.audio = {
            background: new Audio('./media/sound/background.mp3'),
            collect: new Audio('./media/sound/collect.mp3')
        };
        this.audioInitiated = false;
        this.initAudio();
        this.createScenario();
        this.addEvents();
        this.updateTime();
        this.createParticles();
        this.createPages();
        this.collectionEfect();
        this.checkCollisions();
    }

    createScenario() {
        this.character = new Character();
        this.container.appendChild(this.character.element);
        this.createPages();
    }

    createPages() {
        for(let i = 0; i < this.necessaryPages; i++){
            const page = new Page();
            this.pages.push(page);
            this.container.appendChild(page.element);
        }
    }

    createParticles() {
        setInterval(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * this.container.offsetWidth + 'px';
            particle.style.top = Math.random() * this.container.offsetHeight + 'px';
            this.container.appendChild(particle);

            const animation = particle.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: 'translateY(-100px) rotate(360deg)', opacity: 0 }
            ], {
                duration: 3000,
                easing: 'ease-out'
            });

            animation.onfinish = () => particle.remove();
        }, 200);
    }

    updateTime() {
        setInterval(() => {
            const time = Math.floor((Date.now() - this. setTime) / 1000);
            this.timerElement.textContent = time;
        }, 1000);
    }

    addEvents() {
        window.addEventListener("keydown", (e) => this.character.move(e));
        this.checkCollisions();
    }

    collectionEfect(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            this.container.appendChild(particle);

            const angle = (i / 8) * Math.PI * 2;
            const velocity = 5;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            const animation = particle.animate([
                { transform: 'translate(0, 0)', opacity: 1 },
                { transform: `translate(${vx * 20}px, ${vy * 20}px)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });

            animation.onfinish = () => particle.remove();
        }
    }

    initAudio() {
        const audioWarning = document.getElementById('audio-warning');
        
        // Mostrar advertencia si el audio no se puede autoplay
        this.audio.background.play().then(() => {
            audioWarning.style.display = 'none';
        }).catch(() => {
            audioWarning.style.display = 'block';
        });

        // Configurar audio
        this.audio.background.loop = true;
        this.audio.background.volume = 0.5;

        // Control de volumen
        const volumeControl = document.getElementById('volume');
        volumeControl.addEventListener('input', (e) => {
            this.audio.background.volume = e.target.value;
        });

        // Permitir inicio con clic en cualquier parte
        document.addEventListener('click', () => {
            if (!this.audioInitiated) {
                this.audio.background.play();
                audioWarning.style.display = 'none';
                this.audioInitiated = true;
            }
        });
    }

    checkCollisions() {
        setInterval(() => {
            this.pages.forEach((page, index) => {
                if (this.character.collisionWith(page)) {
                    this.collectionEfect(page.x, page.y);
                    this.container.removeChild(page.element);
                    this.pages.splice(index, 1);
                    this.score++;
                    this.scoreElement.textContent = this.score;
                    this.audio.collect.currentTime = 0;
                    this.audio.collect.play();
                    
                    
                    if (this.score >= this.necessaryPages) {
                        this.gameOver();
                    }
                }
            });
        }, 100);
    }

    gameOver() {
        const endTime = Math.floor((Date.now() - this.setTime) / 1000);
        const message= document.createElement("div");
        message.className = "victory-message";
        message.innerHTML = `
            ¡Has encontrado todas las páginas!<br>
            Tiempo: ${endTime} segundos<br>
            <small>El juego se reiniciará en 3 segundos...</small>
        `;
        this.container.appendChild(message);

        // Efecto de partículas de victoria
        const particleInterval = setInterval(() => {
            this.collectionEfect(
                Math.random() * this.container.offsetWidth,
                Math.random() * this.container.offsetHeight
            );
        }, 100);

        setTimeout(() => {
            clearInterval(particleInterval);
            window.location.reload();
        }, 3000);
    }



}
// Aplicar herencia 

class GameObject {
    constructor(container, width, height) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.element = document.createElement("div");
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
    constructor() {
        const container = document.getElementById("game-container");
        super(container, 60, 90); 
        this.speed = 10;
        this.jumpSpeed = 15;
        this.gravity = 0.6;
        this.verticalSpeed = 0;
        this.jumping = false;
        this.rightDirection = true;
        this.x = container.offsetWidth / 2 - this.width / 2;
        this.y = container.offsetHeight - this.height - 30; // Coordenada Y calculada
        this.baseY = container.offsetHeight - this.height - 30; // Ajustar según tu CSS
        this.y = this.baseY;
        this.element.classList.add("character", "normal-character");
        this.updatePosition();
    }

    move(evento) {
        if (evento.key === "ArrowRight") {
            this.x += this.speed;
            this.rightDirection = true;
            this.element.classList.remove("looking-left");
        } else if (evento.key === "ArrowLeft") {
            this.x -= this.speed;
            this.rightDirection = false;
            this.element.classList.add("looking-left");
        } else if ((evento.key === "ArrowUp" || evento.key === " ") && !this.jumping) {
            const highJump = evento.key === " "; // Space = salto alto
            this.startJump(highJump);
        }

          // Límites del contenedor
          this.x = Math.max(0, Math.min(this.x, this.container.offsetWidth - this.width));
          this.updatePosition();
          
          evento.preventDefault(); // Añadir esto para evitar conflicto con scroll
    }

    startJump(highJump = false) {
        if (this.jumping) return;
    
        this.jumping = true;
        this.verticalSpeed = highJump ? -24 : -18; // -18 para ArrowUp (salto normal), -22 para Space (salto alto)
        this.element.classList.add("jumping-character");
    
        this.updateJump();
    }
    

    updateJump() {
        if (this.jumping) {
            this.verticalSpeed += this.gravity;
            this.y += this.verticalSpeed;

            if (this.y >= this.baseY) {
                this.y = this.baseY; 
                this.verticalSpeed = 0;
                this.jumping = false;
                this.element.classList.remove("jumping-character");
                this.element.classList.add("normal-character");
            } else {
                requestAnimationFrame(() => this.updateJump());
            }
    
            this.updatePosition();
        }
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


class Page extends GameObject {
    constructor() {
        const container = document.getElementById("game-container");
        super(container, 20, 30); // Ancho y alto fijos
        
        this.x = Math.random() * (container.offsetWidth - this.width);
        this.y = Math.random() * (container.offsetHeight - this.height);
        
        this.element.classList.add("page");
        this.updatePosition();
    }
}

// Iniciar el juego

window.addEventListener('load', () => {
    const game = new Game();
});