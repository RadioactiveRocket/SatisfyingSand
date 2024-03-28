let mousex
let mousey

let lastevent
let frame = 0
let mousedown = false
let mousebutton = 0
let ltr = true
let searchparams = new URLSearchParams(window.location.search)
let drawing = true

let pattern = searchparams.get("pattern") ?? false
let paused = searchparams.get("paused") ?? false
let brushsize = searchparams.get("brush") ?? 20
let size = searchparams.get("size") ?? 1

let textstyle = {
    "font": "FontAwesome,'Helvetica Neue', Helvetica, Arial, sans-serif",
    "align": "left",
    "color": "rgba(255, 255, 255, 1)",
    "size": 20,
    "background": "rgba(0, 0, 0, 0)",
    "stroke": 0,
    "strokeColor": "rgba(255, 255, 255, 1)",
    "lineHeight": "2em",
    "bold": true,
    "italic": false
};
let textimage = TextImage(textstyle)

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
let ctx = canvas.getContext("2d", {alpha: (searchparams.get("alpha") ?? true)})
canvas.id = "render"
canvas.style.backgroundColor = searchparams.get("bg") ?? "black"

let gridx = searchparams.get("x") ?? Math.round(window.innerWidth / size)
let gridy = searchparams.get("y") ?? Math.round(window.innerHeight / size)

canvas.width = gridx
canvas.height = gridy

let image = ctx.createImageData(canvas.width, canvas.height)
let data = image.data

document.body.prepend(canvas)

// Events

canvas.addEventListener('contextmenu', event => event.preventDefault())

let mousemove = (event) => {
    draw(event)
    document.getElementById("cursor").style.left = Math.round(mousex - document.getElementById("cursor").getBoundingClientRect().width / 2) + "px"
    document.getElementById("cursor").style.top = Math.round(mousey - document.getElementById("cursor").getBoundingClientRect().height / 2) + "px"
}

window.addEventListener('mousemove', mousemove, false)
window.addEventListener('touchmove', mousemove, false)

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
            document.getElementById("playpausebutton").click()
        } else if (event.key == "c") {
            document.getElementById("clearbutton").click()
        } else if (event.key == "t") {
            document.getElementById("drawtextbutton").click()
        }
    }
})

document.addEventListener("keydown", function(event) {
    if (!(["TEXTAREA", "SELECT", "OPTION"].includes(event.target.tagName) || event.target.type == "text")) { // If not typing in a textbox.
        if (event.key == "ArrowRight" || event.key == "ArrowUp") {
            brushsize += 1
        } else if (event.key == "ArrowLeft" || event.key == "ArrowDown") {
            if (brushsize > 0) {
                brushsize -= 1
            }
        } else if (event.key == "Shift") {
            pattern = !pattern
        }
    }
})

document.ondrop = (event) => {
    event.preventDefault()
    loadfiles(event.dataTransfer.files, getmousepos(canvas, event), event.shiftKey, event.ctrlKey)
}

document.onpaste = (event) => {
    event.preventDefault();
    event.clipboardData.files

    loadfiles(event.clipboardData.files, getmousepos(canvas, event))

    let colour

    if (event.clipboardData.getData('Text')) {
        if (mousebutton != 2) {
            colour = colours[wrapindex(colours.length, frame)]
        } else {
            colour = [0,0,0,0]
        }

        textimage.style.color = `rgba(${colour[0]},  ${colour[1]}, ${colour[2]}, ${(colour[3] ?? 255) / 255})`
        stampimage(textimage.toDataURL(event.clipboardData.getData('Text')))
    }
}

document.ondragover = (event) => {
    event.preventDefault();
}

document.getElementById("loadinput").addEventListener("change", (e) => {
    image = ctx.createImageData(canvas.width, canvas.height)
    data = image.data
    
    loadfiles(document.getElementById("loadinput").files, undefined, true)
})

document.getElementById("importinput").addEventListener("change", (e) => {
    image = ctx.createImageData(canvas.width, canvas.height)
    data = image.data
    
    loadfiles(document.getElementById("importinput").files)
})

// Functions

function loadfiles(files, m, shiftpressed, ctrlpressed) {
    let mpos = m ?? {x: undefined, y: undefined}

    ;[...files].forEach((file, index) => {
        let reader = new FileReader()

        if (file.type.includes("image")) {
            reader.onload = function (e) {
                if (ctrlpressed) {
                    loadimage(e.target.result, mpos.x, mpos.y)
                } else if (shiftpressed) {
                    loadimage(e.target.result)
                } else {
                    stampimage(e.target.result, mpos.x, mpos.y)
                }
            }

            reader.readAsDataURL(file)
        } else {
            let colour

            if (mousebutton != 2) {
                colour = colours[wrapindex(colours.length, frame)]
            } else {
                colour = [0,0,0,0]
            }

            reader.onload = function (e) {
                textimage.style.color = `rgba(${colour[0]},  ${colour[1]}, ${colour[2]}, ${(colour[3] ?? 255) / 255})`
                if (ctrlpressed) {
                    loadimage(textimage.toDataURL(e.target.result), mpos.x, mpos.y)
                } else if (shiftpressed) {
                    loadimage(textimage.toDataURL(e.target.result))
                } else {
                    stampimage(textimage.toDataURL(e.target.result), mpos.x, mpos.y)
                }
            }
            
            reader.readAsText(file)
        }
    })   
}

function loadimage(url, x, y) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.addEventListener("load", () => {
        let imagewidth = img.width / (searchparams.get("imagesize") ?? 1)
        let imageheight = img.height / (searchparams.get("imagesize") ?? 1)
        let left = Math.round((x ?? canvas.width / 2) - imagewidth / 2)
        let top = Math.round((y ?? canvas.height / 2) - imageheight / 2) 
        ctx.drawImage(img, left, top, imagewidth, imageheight);

        image = ctx.getImageData(0, 0, canvas.width, canvas.height)
        data = image.data
    });
}

function stampimage(url, x, y) {
    drawing = false

    let img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.id = "cursor"
    img.style.top = x
    img.style.left = y
    img.addEventListener("load", () => {
        let imagewidth = img.width / (searchparams.get("imagesize") ?? 1)
        let imageheight = img.height / (searchparams.get("imagesize") ?? 1)
        document.body.prepend(img)
        
        let drawimg = () => {
            img.remove()

            ctx.drawImage(img, Math.round(mousex - imagewidth / 2), Math.round(mousey - imageheight / 2), imagewidth, imageheight);

            image = ctx.getImageData(0, 0, canvas.width, canvas.height)
            data = image.data

            window.addEventListener('mousemove', () => {drawing = true}, {once : true})
            window.addEventListener('touchmove', () => {drawing = true}, {once : true})
        }

        canvas.addEventListener('mousedown', drawimg, {once : true})
        canvas.addEventListener("touchstart", drawimg, {once : true})
    });
}

function wrapindex(wrap, index) {
    return (index % wrap + wrap) % wrap
}

function draw(event) {
    let m
    if (event?.touches) {
        m = getmousepos(canvas, event.touches[0])
    } else {
        m = getmousepos(canvas, event)
    }

    let colour
    if (mousebutton != 2) {
        colour = colours[wrapindex(colours.length, frame)]
    } else {
        colour = [0,0,0,0]
    }

    mousex = m.x
    mousey = m.y

    if (mousedown && drawing == true) {
        for (let oy = -brushsize; oy <= brushsize; oy++) {
            for (let ox = -brushsize; ox <= brushsize; ox++) {
                let x = Math.round(mousex)+ox
                let y = Math.round(mousey)+oy
                
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

function savecanvasasimage(name) {
    let link = document.createElement('a');
    link.download = name+".png"
    link.href = canvas.toDataURL()
    link.click()
}

function drawtext(text) {
    let colour
            
    if (mousebutton != 2) {
        colour = colours[wrapindex(colours.length, frame)]
    } else {
        colour = [0,0,0,0]
    }

    textimage.style.color = `rgba(${colour[0]},  ${colour[1]}, ${colour[2]}, ${(colour[3] ?? 255) / 255})`
    stampimage(textimage.toDataURL(text))
}

function getmousepos(canvas, event) {
    var rect = canvas.getBoundingClientRect()
    lastevent = event
    return {
        x: (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
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

loadimage(searchparams.get("image"))
update()
