let mousex
let mousey
let lastevent
let frame = 0
let mousedown = false
let mousebutton = 0
let pattern = false
let paused = false
let ltr = true

let brushsize = (new URLSearchParams(window.location.search)).get("brush") ?? 20
let size = (new URLSearchParams(window.location.search)).get("size") ?? 1

// Colours

let rainbow = [[255,0,0,255],[255,64,0,255],[255,128,0,255],[255,191,0,255],[255,255,0,255],[191,255,0,255],[128,255,0,255],[64,255,0,255],[0,255,0,255],[0,255,64,255],[0,255,128,255],[0,255,191,255],[0,255,255,255],[0,191,255,255],[0,128,255,255],[0,64,255,255],[0,0,255,255],[64,0,255,255],[128,0,255,255],[191,0,255,255],[255,0,255,255],[255,0,191,255],[255,0,128,255],[255,0,64,255],[255,0,0,255]]
let pastelrainbow = [[255,204,204,255],[255,230,179,255],[255,255,204,255],[204,255,204,255],[204,255,255,255],[204,230,255,255],[230,204,255,255],[255,204,255,255]]
let grayscale = [[32,32,32,255],[64,64,64,255],[96,96,96,255],[128,128,128,255],[160,160,160,255],[192,192,192,255],[224,224,224,255],[245,245,245,245]]
let bw = [[32,32,32,255],[245,245,245,245]]
let rgb = [[255,0,0,255],[0,255,0,255],[0,0,255,255]]
let rygcbm = [[255,0,0,255],[255,255,0,255],[0,255,0,255],[0,255,255,255],[0,0,255,255],[255,0,255,255]]
let blueorange = [[1,8,79,255],[57,25,84,255],[99,30,80,255],[167,60,90],[255,121,84]]
let softpurple = [[255,230,230],[225,175,209],[173,136,198],[116,105,182]]
let pinkorangeblue = [[89,213,224],[245,221,97],[250,163,0],[244,83,138]]
let redblack = [[255,32,78],[160,21,62],[93,14,65],[0,34,77]]
let sunset = [[255,243,199],[254,199,180],[252,129,158],[247,65,143]]
let greenyellow = [[0,127,11],[76,205,153],[255,199,0],[255,244,85]]
let fire = [[144,12,63],[199,0,57],[249,76,16],[248,222,34]]
let popsicle = [[255,85,187],[255,211,163],[252,255,178],[182,234,250]]
let toybox = [[0,121,255],[0,223,162],[246,250,112],[255,0,96]]
let neon = [[255,3,3],[132,0,255],[0,255,246],[0,40,255],[0,255,40]]
let erase = [[0,0,0,0]]

let colours = rainbow

// Canvas

let canvas = document.createElement("canvas")
let ctx = canvas.getContext("2d", {alpha: ((new URLSearchParams(window.location.search)).get("alpha") ?? true)})
canvas.id = "render"

let gridx = (new URLSearchParams(window.location.search)).get("x") ?? Math.round(window.innerWidth / size)
let gridy = (new URLSearchParams(window.location.search)).get("y") ?? Math.round(window.innerHeight / size)

canvas.width = gridx
canvas.height = gridy

let image = ctx.createImageData(canvas.width, canvas.height)
let data = image.data

document.body.prepend(canvas)

// Events

canvas.addEventListener('contextmenu', event => event.preventDefault())

window.addEventListener('mousemove', draw, false)
window.addEventListener('touchmove', draw, false)

let mouseputdown = (event) => {mousedown = true; mousebutton = event.button ?? 0; draw(event)}
canvas.addEventListener('mousedown', mouseputdown, false)
canvas.addEventListener("touchstart", mouseputdown, false)

let mousereleased = () => {mousedown = false}
window.addEventListener("mouseup", mousereleased, false)
window.addEventListener("touchend", mousereleased, false)

document.addEventListener("keypress", function(event) {
    if (!(["TEXTAREA", "SELECT", "OPTION"].includes(event.target.tagName) || event.target.type == "text")) { // If not typing in a textbox.
        if (event.key == "1") {
            colours = rainbow
        } else if (event.key == "2") {
            colours = grayscale
        } else if (event.key == "3") {
            colours = toybox
        } else if (event.key == "4") {
            colours = sunset
        } else if (event.key == "5") {
            colours = fire
        } else if (event.key == "6") {
            colours = redblack
        } else if (event.key == "7") {
            colours = popsicle
        } else if (event.key == "8") {
            colours = pinkorangeblue
        } else if (event.key == "9") {
            colours = softpurple
        } else if (event.key == "r") {
            colours = rgb
        } else if (event.key == "e") {
            colours = rygcbm
        } else if (event.key == "y") {
            colours = greenyellow
        } else if (event.key == "b") {
            colours = blueorange
        } else if (event.key == "p") {
            colours = pastelrainbow
        } else if (event.key == "m") {
            colours = bw
        } else if (event.key == "n") {
            colours = neon
        } else if (event.key == "0") {
            colours = erase
        } else if (event.key == " ") {
            paused = !paused
        } else if (event.key == "c") {
            location.reload()
        }
    }
})

document.addEventListener("keydown", function(event) {
    if (!(["TEXTAREA", "SELECT", "OPTION"].includes(event.target.tagName) || event.target.type == "text")) { // If not typing in a textbox.
        if (event.key == "ArrowRight" || event.key == "ArrowUp") {
            brushsize += 1
        } else if (event.key == "ArrowLeft" || event.key == "ArrowDown") {
            brushsize -= 1
        } else if (event.key == "Shift") {
            pattern = !pattern
        }
    }
})

// Functions

function wrapindex(wrap, index) {
    return (index % wrap + wrap) % wrap
}

function draw(event) {
    let colour
    if (mousebutton != 2) {
        colour = colours[wrapindex(colours.length, frame)]
    } else {
        colour = [0,0,0,0]
    }

    if (mousedown) {
        let m
        if (event?.touches) {
            m = getmousepos(canvas, event.touches[0])
        } else {
            m = getmousepos(canvas, event)
        }

        for (let oy = -brushsize; oy <= brushsize; oy++) {
            for (let ox = -brushsize; ox <= brushsize; ox++) {
                let x = Math.round(m.x)+ox
                let y = Math.round(m.y)+oy
                
                if (pattern && mousebutton != 2) {
                    colour = colours[wrapindex(colours.length, Math.round((frame+x+y)))]
                }

                let fx = x
                let fy = y*gridx

                data[(fx+fy)*4] = colour[0]
                data[(fx+fy)*4+1] = colour[1]
                data[(fx+fy)*4+2] = colour[2]
                data[(fx+fy)*4+3] = colour[3] ?? 255
            }
        }
    }
}

function getmousepos(canvas, evt) {
    var rect = canvas.getBoundingClientRect()
    lastevent = evt
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    }
}

function update() {
    if (mousedown) {
        draw(lastevent)
    }

    if (!paused) {
        for (let y = gridy - 1; y >= 0; y--) {
            if (ltr) {
                for (let x = 0; x < gridx; x++) { // Left to right.
                    let i = (y * gridx + x) * 4;
                    if (data[i + 3] != 0) {
                        let colour = [data[i + 0], data[i + 1], data[i + 2], data[i + 3]]

                        if (data[gridx*4+i + 3] == 0) { // Down.
                            data[i + 3] = 0

                            data[gridx*4+i + 0] = colour[0]
                            data[gridx*4+i + 1] = colour[1]
                            data[gridx*4+i + 2] = colour[2]
                            data[gridx*4+i + 3] = colour[3]

                        } else if (data[(gridx+1)*4+i + 3] == 0) { // Down right. 
                            data[i + 3] = 0
                            data[(gridx+1)*4+i + 0] = colour[0]
                            data[(gridx+1)*4+i + 1] = colour[1]
                            data[(gridx+1)*4+i + 2] = colour[2]
                            data[(gridx+1)*4+i + 3] = colour[3]

                        } else if (data[(gridx-1)*4+i + 3] == 0) { // Down left.
                            data[i + 3] = 0
                            data[(gridx-1)*4+i + 0] = colour[0]
                            data[(gridx-1)*4+i + 1] = colour[1]
                            data[(gridx-1)*4+i + 2] = colour[2]
                            data[(gridx-1)*4+i + 3] = colour[3]
                        }   
                    }
                }

            } else {
                for (let x = gridx - 1; x >= 0; x--) { // Right to left.
                    let i = (y * gridx + x) * 4;
                    if (data[i + 3] != 0) {
                        let colour = [data[i + 0], data[i + 1], data[i + 2], data[i + 3]]

                        if (data[gridx*4+i + 3] == 0) { // Down.
                            data[i + 3] = 0

                            data[gridx*4+i + 0] = colour[0]
                            data[gridx*4+i + 1] = colour[1]
                            data[gridx*4+i + 2] = colour[2]
                            data[gridx*4+i + 3] = colour[3]

                        } else if (data[(gridx+1)*4+i + 3] == 0) { // Down right. 
                            data[i + 3] = 0
                            data[(gridx+1)*4+i + 0] = colour[0]
                            data[(gridx+1)*4+i + 1] = colour[1]
                            data[(gridx+1)*4+i + 2] = colour[2]
                            data[(gridx+1)*4+i + 3] = colour[3]

                        } else if (data[(gridx-1)*4+i + 3] == 0) { // Down left.
                            data[i + 3] = 0
                            data[(gridx-1)*4+i + 0] = colour[0]
                            data[(gridx-1)*4+i + 1] = colour[1]
                            data[(gridx-1)*4+i + 2] = colour[2]
                            data[(gridx-1)*4+i + 3] = colour[3]
                        }
                    }
                }
            }
        }
    }

    ctx.putImageData(image, 0, 0)
    ltr = !ltr
    frame++

    requestAnimationFrame(update)
}

update() // Start.
