class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const friction = 0.985
class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startBtn = document.querySelector('#startGameBtn')
const modalEl = document.getElementById('modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

const spawnx = canvas.width/2
const spawny = canvas.height/2

let player = new Player(spawnx, spawny, 20, `white`)
let projectiles = []
let enemies = []
let particles = []

function init(){
    player = new Player(spawnx, spawny, 20, `white`)
    projectiles = []
    enemies = []
    particles = []
    score = 0
}

function spawnenemy(){
    //定時呼叫 (Action, Time)
    setInterval(()=>{
        let radius = Math.random() * (30 - 10) + 10
        
        let x
        let y
        if(Math.random() < 0.5){
            x = Math.random() < 0.5?  0 - radius:canvas.width + radius
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5?  0 - radius:canvas.height + radius
        }
        
        let color = `hsl(${Math.random() * 360}, 50%, 50%)`
        let angle = Math.atan2(spawny - y, spawnx - x)
        let velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(
            x, y, radius, color, velocity
        ))
    }, 500)
}

let animationId
let score = 0
//網頁畫面更新
function animate(){
    //開始這個Id動畫更新畫面
    animationId = requestAnimationFrame(animate)
    //c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)' //c.fillStyle = 'black' 
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
            particle.update()
        }
    })
    projectiles.forEach((projectile, index)=>{
        projectile.update()

        if(projectile.x < -projectile.radius || 
           projectile.x > canvas.width + projectile.radius ||
           projectile.y < -projectile.radius ||
           projectile.y > canvas.height + projectile.radius){
                setTimeout(()=>{
                    projectiles.splice(index, 1)
                }, 0)
           }
    })
    enemies.forEach((enemy, index)=>{
        enemy.update()

        //end game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - enemy.radius - player.radius < 0){
            //停止這個Id的動畫更新畫面
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) =>{
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            //projectile touch enemy
            if(dist - enemy.radius - projectile.radius < 1){

                //increase the score
                score += 100

                //explosion particles
                for(let i = 1; i<=enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: Math.random() * (Math.random() - 0.5) * 8,
                        y: Math.random() * (Math.random() - 0.5) * 8
                    }))
                }

                if(enemy.radius - 10 >= 10){
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                }else{
                    score += 250
                    setTimeout(()=>{
                        enemies.splice(index, 1)
                    }, 0)
                }
                scoreEl.innerHTML = score
                setTimeout(()=>{
                    projectiles.splice(projectileIndex, 1)
                }, 0)
            }
        })
    })
}

//mouse click event
window.addEventListener('click', (event)=>{
    const angle = Math.atan2(event.clientY - spawny, event.clientX - spawnx)
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }
    projectiles.push(new Projectile(
        spawnx, 
        spawny, 
        5, 
        player.color, 
        velocity
    ))
})

startBtn.addEventListener('click', ()=>{
    init()
    animate()
    spawnenemy()
    scoreEl.innerHTML = score
    modalEl.style.display = 'none'
})