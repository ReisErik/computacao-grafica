const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([
    0.0, 0.0, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([
    0.0, 1.0, 0.0,
]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.0, 0.0,
]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);

let MbarraDireita = m3.translation(0.9, 0.0);

let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}

`;


// --------------------------------------------------
// COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;

function drawScene(){
    
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraEsquerda
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraDireita
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );

}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------

let tyBE = 0.0;
let txBE = -0.9;
let tyBE_offset = 0.05; 
let txBE_offset = 0.2;

let tyBD = 0.0;
let txBD = +0.9;
let tyBD_offset = 0.05; 
let txBD_offset = 0.2;

let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.005;
let tyBola_offset = 0.005;

let pontos_esquerdo = 0;
let pontos_direito = 0;

function atualizaAnimacao(){

    txBola += txBola_offset;
    tyBola += tyBola_offset;

    if(tyBola > 1.0 || tyBola<-1.0)
        tyBola_offset = -tyBola_offset;

    if (txBola > 0.9){ //Esquerdo venceu
        txBola = 0;
        tyBola = 0;
        pontos_esquerdo++;
        txBola_offset = (Math.random() < 0.5 ? -1 : 1) * 0.005; // variar direção em que a bolinha começa no eixo x
        tyBola_offset = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 0.01); // variar o angulo em que se inicia
    }
    else if(txBola < -0.9) { //Direito venceu
        txBola = 0;
        tyBola = 0;
        pontos_direito++;   
        txBola_offset = (Math.random() < 0.5 ? -1 : 1) * 0.005; // variar direção em que a bolinha começa no eixo x
        tyBola_offset = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 0.01); // variar o angulo em que se inicia
    }

    if(verificaColisao()){
        txBola_offset = -txBola_offset;

        tyBola_offset = (Math.random() * 0.01); // variar direção/angulo a cada colisao
    }


    MbolaCentro = m3.translation(txBola,tyBola);

    document.getElementById("esquerdo").textContent = "Esquerdo: " + pontos_esquerdo;
    document.getElementById("direito").textContent = "Direto: " + pontos_direito;
}


function verificaColisao(){
    hitbox_bola = [
        txBola - 0.05, //esquerda
        txBola + 0.05, //direita
        tyBola - 0.05, //baixo
        tyBola + 0.05  //cima
    ];

    hitbox_barra_direita = [
        txBD - 0.05, //esquerda
        txBD + 0.05, //direita
        tyBD - 0.2,  //baixo
        tyBD + 0.2   //cima
    ];

    hitbox_barra_esquerda = [
        txBE - 0.05, //esquerda
        txBE + 0.05, //direita
        tyBE - 0.2,  //baixo
        tyBE + 0.2   //cima
    ];

    if ( hitbox_bola[1] >= hitbox_barra_direita[0] && // verifica eixo X
         hitbox_bola[0] <= hitbox_barra_direita[1] &&
         hitbox_bola[2] >= hitbox_barra_direita[2] && // verifica eixo y
         hitbox_bola[3] <= hitbox_barra_direita[3]    
     ){
        return true
    }

    if ( hitbox_bola[0] <= hitbox_barra_esquerda[1] && // verifica eixo X
         hitbox_bola[1] >= hitbox_barra_esquerda[0] &&
         hitbox_bola[2] >= hitbox_barra_esquerda[2] && // verifica eixo y
         hitbox_bola[3] <= hitbox_barra_esquerda[3]    
     ){
        return true
    }
}


// --------------------------------------------------
// Comandos
// --------------------------------------------------

document.addEventListener(
  "keydown",
  keyboardClick,
  false
);

function keyboardClick(event) {

  switch(event.key) {
      case "w":
            if(tyBE <= 0.8){
                tyBE += tyBE_offset
                MbarraEsquerda = m3.translation(txBE, tyBE)
            }
        break;
      case "s":
            if(tyBE >= -0.8){
                tyBE -= tyBE_offset
                MbarraEsquerda = m3.translation(txBE, tyBE)
            }
        break;
      case "ArrowUp":
            if(tyBD <= 0.8){
                tyBD += tyBD_offset
                MbarraDireita = m3.translation(txBD, tyBD)
            }
        break;
      case "ArrowDown":
            if(tyBD >= -0.8){
                tyBD -= tyBD_offset
                MbarraDireita = m3.translation(txBD, tyBD)
            }
        break;
  }
}


// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

drawScene();