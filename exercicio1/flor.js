const flor = document.getElementById("flor");
const gl = flor.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VÉRTICES
// --------------------------------------------------

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

const vertices = new Float32Array([
    //Talo
    0.05, 0.4,
    0.05, -0.4,
    -0.05, -0.4,

    0.05, 0.4,
    -0.05, 0.4,
    -0.05, -0.4,

    // Petalas
    ...circleVertices(0, 0.6, 0.2),
    ...circleVertices(0, 0.2, 0.2),
    ...circleVertices(0.2, 0.4, 0.2),
    ...circleVertices(-0.2, 0.4, 0.2),

    //Meio
    ...circleVertices(0, 0.4, 0.2),


]);

function createColors(numVertices, r, g, b) {
    const colors = [];

    for (let i = 0; i < numVertices; i++) {
        colors.push(r, g, b);
    }

    return colors;
}

const colors = new Float32Array([
    //talo
    0.588, 0.294, 0.0,
    0.588, 0.294, 0.0,
    0.588, 0.294, 0.0,

    0.588, 0.294, 0.0,
    0.588, 0.294, 0.0,
    0.588, 0.294, 0.0,

    //petalas
    ...createColors(12, 0, 1, 0),
    ...createColors(12, 0, 1, 0),
    ...createColors(12, 1, 0, 0),
    ...createColors(12, 1, 0, 0),

    //meio
    ...createColors(12, 1.0, 0.647, 0.0),


])

// --------------------------------------------------
// 2. BUFFER
// --------------------------------------------------

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

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

const fragmentShaderSource = `#version 300 es

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
// 6. CRIAR PROGRAMA
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
// 7. LOCAL DO ATRIBUTO
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation = 
    gl.getAttribLocation(
        program,
        "aColors"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTO
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);


// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 10. DESENHAR
// --------------------------------------------------

gl.useProgram(program);

gl.drawArrays(
    gl.TRIANGLES,
    0,
    12
);

gl.drawArrays(
    gl.TRIANGLES,
    3,
    12
);

gl.drawArrays(
    gl.TRIANGLE_FAN,
    6,
    12
);

gl.drawArrays(
    gl.TRIANGLE_FAN,
    18,
    12
);

gl.drawArrays(
    gl.TRIANGLE_FAN,
    30,
    12
);

gl.drawArrays(
    gl.TRIANGLE_FAN,
    42,
    12
);

gl.drawArrays(
    gl.TRIANGLE_FAN,
    54,
    12
);
