const canvas_carro = document.getElementById("carro");
const gl_carro = canvas_carro.getContext("webgl2");

if (!gl_carro) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

const vertices_carro = new Float32Array([
    -0.4, 0.2,
    -0.4, 0,
    0.4, 0.2,

    0.4, 0.2,
    -0.4, 0,
    0.4, 0,

    0.4, 0.2,
    0.4, 0,
    0.6, 0,

    0.6, 0,
    0.4, 0,
    0.4, -0.2,

    0.6, 0,
    0.4, -0.2,
    0.6, -0.2,

    0.6, 0,
    0.6, -0.08,
    0.8, -0.08,

    0.8, -0.08,
    0.6, -0.08,
    0.6, -0.2,

    0.8, -0.08,
    0.6, -0.2,
    0.8, -0.2,

    0.4, 0,
    -0.4, 0,
    0.4, -0.2,

    -0.4, 0,
    -0.4, -0.2,
    0.4, -0.2,

    -0.4, 0.2,
    -0.5, 0,
    -0.4, 0,

    -0.4, 0,
    -0.5, 0,
    -0.5, -0.2,

    -0.4, 0,
    -0.5, -0.2,
    -0.4, -0.2,

    ...circleVertices(-0.2, -0.2, 0.1),
    ...circleVertices(0.4, -0.2, 0.1)

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

const colors_carro = new Float32Array([
    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,1,

    0.75, 0.75, 0.75,
    0.75, 0.75, 0.75,
    0.75, 0.75, 0.75,

    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,0,

    0,0,0,
    0,0,1,
    0,0,1,

    0,0,0,
    0,0,1,
    0,0,0,

    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,1,

    0,0,1,
    0,0,1,
    0,0,1,

    ...createColors(12, 0, 0, 0),
    ...createColors(12, 0, 0, 0),

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

const verticesBuffer_carro = gl_carro.createBuffer();

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, verticesBuffer_carro);

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    vertices_carro,
    gl_carro.STATIC_DRAW
);

const colorsBuffer_carro = gl_carro.createBuffer();

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, colorsBuffer_carro);

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    colors_carro,
    gl_carro.STATIC_DRAW
);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_carro = `#version 300 es

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

const fragmentShaderSource_carro = `#version 300 es

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


const vertexShader_carro = createShader(
    gl_carro,
    gl_carro.VERTEX_SHADER,
    vertexShaderSource_carro
);

const fragmentShader_carro = createShader(
    gl_carro,
    gl_carro.FRAGMENT_SHADER,
    fragmentShaderSource_carro
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_carro = gl_carro.createProgram();

gl_carro.attachShader(program_carro, vertexShader_carro);
gl_carro.attachShader(program_carro, fragmentShader_carro);

gl_carro.linkProgram(program_carro);

if (!gl_carro.getProgramParameter(program_carro, gl_carro.LINK_STATUS)) {

    throw new Error(
        gl_carro.getProgramInfoLog(program_carro)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_carro =
    gl_carro.getAttribLocation(
        program_carro,
        "aPosition"
    );

const colorsLocation_carro =
    gl_carro.getAttribLocation(
        program_carro,
        "aColors"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, verticesBuffer_carro);

gl_carro.enableVertexAttribArray(positionLocation_carro);

gl_carro.vertexAttribPointer(
    positionLocation_carro,
    2,
    gl_carro.FLOAT,
    false,
    0,
    0
);

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, colorsBuffer_carro);

gl_carro.enableVertexAttribArray(colorsLocation_carro);

gl_carro.vertexAttribPointer(
    colorsLocation_carro,
    3,
    gl_carro.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl_carro.clearColor(0.1, 0.1, 0.1, 1.0);

gl_carro.clear(gl_carro.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl_carro.useProgram(program_carro);

gl_carro.drawArrays(
    gl_carro.TRIANGLES,
    0, 
    39
);

gl_carro.drawArrays(
    gl_carro.TRIANGLE_FAN,
    39, 
    12
);

gl_carro.drawArrays(
    gl_carro.TRIANGLE_FAN,
    51, 
    12
);
