const robo = document.getElementById("robo");
const gl_robo = robo.getContext("webgl2");

if (!robo) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

const vertices_robo = new Float32Array([
    
    // cabeca
    0.6, 0.6,
    -0.6, 0.6,
    -0.6, -0.6,

    0.6, 0.6,
    -0.6, -0.6,
    0.6, -0.6,

    // boca
    0.5, -0.2,
    -0.5, -0.2,
    -0.5, -0.4,

    0.5, -0.2,
    -0.5, -0.4,
    0.5, -0.4,

    //olhos
    ...circleVertices(0.2, 0.2, 0.15),
    ...circleVertices(-0.2, 0.2, 0.15),

    //antena
    0.05, 0.8,
    -0.05, 0.8,
    -0.05, 0.6,

    0.05, 0.8,
    -0.05, 0.6,
    0.05, 0.6,

    //ponta antena
    0.05, 0.9,
    -0.05, 0.9,
    -0.05, 0.8,

    0.05, 0.9,
    -0.05, 0.8,
    0.05, 0.8,

    //orelha
    0.6, 0.4,
    0.6, -0.4,
    0.7, 0,

    -0.6, 0.4,
    -0.6, -0.4,
    -0.7, 0,

    //corpo
    1, -0.6,
    -1, -0.6,
    -1, -1,

    1, -0.6,
    -1, -1,
    1, -1


    ]);

function circleVertices(x, y, r) {
    const vertices = [];

    vertices.push(x, y);

    const radius = r;
    const numSides = 10;

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        vertices.push(px, py);
    }

    return vertices;
}

// --------------------------------------------------
// COLORS
// --------------------------------------------------

const colors_robo = new Float32Array([
    //cabeca
    0,0,1, 
    0,0,1, 
    0,0,1, 

    0,0,1, 
    0,0,1, 
    0,0,1, 

    //boca
    0.1, 0.1, 0.1,
    0.1, 0.1, 0.1,
    0.1, 0.1, 0.1,

    0.1, 0.1, 0.1,
    0.1, 0.1, 0.1,
    0.1, 0.1, 0.1,

    //olhos
    ...createColors(12, 1, 0, 0),
    ...createColors(12, 1, 0, 0),

    //antena
    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,1,
    
    //ponta antena
    1,0,0,
    1,0,0,
    1,0,0,

    1,0,0,
    1,0,0,
    1,0,0,

    // orelha
    0,0.25,0.5, 
    0,0.25,0.5, 
    0,0.25,0.5, 

    0,0.25,0.5, 
    0,0.25,0.5, 
    0,0.25,0.5, 

    //corpo
    0,0,1, 
    0,0,1, 
    0,0,1, 

    0,0,1, 
    0,0,1, 
    0,0,1, 
]);

function createColors(numVertices, r, g, b) {
    const colors = [];

    for (let i = 0; i < numVertices; i++) {
        colors.push(r, g, b);
    }

    return colors;
}

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer_robo = gl_robo.createBuffer();

gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, verticesBuffer_robo);

gl_robo.bufferData(
    gl_robo.ARRAY_BUFFER,
    vertices_robo,
    gl_robo.STATIC_DRAW
);

const colorsBuffer_robo = gl_robo.createBuffer();

gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, colorsBuffer_robo);

gl_robo.bufferData(
    gl_robo.ARRAY_BUFFER,
    colors_robo,
    gl_robo.STATIC_DRAW
);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_robo = `#version 300 es

in vec2 aPosition;
in vec3 aColors;

out vec3 vColors;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColors = aColors;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource_robo = `#version 300 es

precision mediump float;

in vec3 vColors;

out vec4 outColor;

void main() {
    outColor = vec4(vColors, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
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


const vertexShader_robo = createShader(
    gl_robo,
    gl_robo.VERTEX_SHADER,
    vertexShaderSource_robo
);

const fragmentShader_robo = createShader(
    gl_robo,
    gl_robo.FRAGMENT_SHADER,
    fragmentShaderSource_robo
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_robo = gl_robo.createProgram();

gl_robo.attachShader(program_robo, vertexShader_robo);
gl_robo.attachShader(program_robo, fragmentShader_robo);

gl_robo.linkProgram(program_robo);

if (!gl_robo.getProgramParameter(program_robo, gl_robo.LINK_STATUS)) {

    throw new Error(
        gl_robo.getProgramInfoLog(program_robo)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_robo =
    gl_robo.getAttribLocation(
        program_robo,
        "aPosition"
    );

const colorsLocation_robo =
    gl_robo.getAttribLocation(
        program_robo,
        "aColors"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, verticesBuffer_robo);

gl_robo.enableVertexAttribArray(positionLocation_robo);

gl_robo.vertexAttribPointer(
    positionLocation_robo,
    2,
    gl_robo.FLOAT,
    false,
    0,
    0
);

gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, colorsBuffer_robo);

gl_robo.enableVertexAttribArray(colorsLocation_robo);

gl_robo.vertexAttribPointer(
    colorsLocation_robo,
    3,
    gl_robo.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl_robo.clearColor(0.1, 0.1, 0.1, 1.0);

gl_robo.clear(gl_robo.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl_robo.useProgram(program_robo);

//cabeca e boca
gl_robo.drawArrays(
    gl_robo.TRIANGLES,
    0, 
    12
);

//olho direito
gl_robo.drawArrays(
    gl_robo.TRIANGLE_FAN,
    12, 
    12
);

//olho esquerdo
gl_robo.drawArrays(
    gl_robo.TRIANGLE_FAN,
    24, 
    12
);

//antena, ponta antena, orelha, corpo
gl_robo.drawArrays(
    gl_robo.TRIANGLES,
    36, 
    24
);

