(() => {
const canvas = document.getElementById("linha");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const canvasCoordinates =
    document.getElementById(
        "canvasCoordinates"
    );

const webglCoordinates =
    document.getElementById(
        "webglCoordinates"
    );

const colorBox =
    document.getElementById(
        "colorBox"
    );

const colorName =
    document.getElementById(
        "colorName"
    );

// --------------------------------------------------
// 1a. VERTICES
// --------------------------------------------------

let vertices = new Float32Array([0.0,0.0]);

// --------------------------------------------------
// 1b. CORES
// --------------------------------------------------

let colors = new Float32Array([
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0
]);

// --------------------------------------------------
// 1c. TAMANHO DOS PONTOS
// --------------------------------------------------

let pointSizes = new Float32Array([10.0, 10.0]);
let pointSizes_aux = 10.0;

// --------------------------------------------------
// Dados para o bresenham
// --------------------------------------------------

const pixel_point = [];
const location_point = [];

let verticesLinha = [];
let colorsLinha = [];
let pointSizesLinha = [];

let vertices_linha = new Float32Array([]);
let colors_linha = new Float32Array([]);
let pointSizes_linha = new Float32Array([]);

// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const colorsBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors,
    gl.STATIC_DRAW
);

const pointSizesBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    pointSizes,
    gl.STATIC_DRAW
);

const pointsLinhaBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, pointsLinhaBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices_linha,
    gl.STATIC_DRAW
);

const pointsLinhaColorBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, pointsLinhaColorBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    colors_linha,
    gl.STATIC_DRAW
);

const LinhaSizeBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, LinhaSizeBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    pointSizes_linha,
    gl.STATIC_DRAW
);

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;
in vec3 aColor;
in float aPointSize;

out vec3 vColor;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
    vColor = aColor;
}
`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

in vec3 vColor;
out vec4 outColor;

void main() {
    outColor = vec4(vColor, 1.0);
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
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getAttribLocation(
        program,
        "aColor"
    );

const pointSizeLocation =
    gl.getAttribLocation(
        program,
        "aPointSize"
    );

// --------------------------------------------------
// 8. CONFIGURAR ATRIBUTOS
// --------------------------------------------------

gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

gl.enableVertexAttribArray(positionLocation);

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

gl.enableVertexAttribArray(colorLocation);

gl.vertexAttribPointer(
    colorLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
);

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizesBuffer);

gl.enableVertexAttribArray(pointSizeLocation);

gl.vertexAttribPointer(
    pointSizeLocation,
    1,
    gl.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 9. INTERAÇÃO COM O MOUSE
// --------------------------------------------------

function adiciona_pixel(x, y) {
    const webglX =
        (x / canvas.width) * 2 - 1;

    const webglY =
        -((y / canvas.height) * 2 - 1);

    verticesLinha.push(webglX, webglY);
    colorsLinha.push(...color_aux);
    pointSizesLinha.push(pointSizes_aux);
}

function bresenham(x1, y1, x2, y2) {

    verticesLinha = [];
    colorsLinha = [];
    pointSizesLinha = [];

    // Linha horizontal
    if (y1 === y2) {

        if (x1 > x2) {
            let aux = x1;
            x1 = x2;
            x2 = aux;
        }

        let x = x1;

        while (x <= x2) {
            adiciona_pixel(x, y1);
            x++;
        }
    }
    // Linha vertical
    else if (x1 === x2) {

        if (y1 > y2) {
            let aux = y1;
            y1 = y2;
            y2 = aux;
        }

        let y = y1;

        while (y <= y2) {
            adiciona_pixel(x1, y);
            y++;
        }
    }

    // 0 < m < 1
    else if (Math.abs(x2 - x1) >= Math.abs(y2 - y1)) {

        if (x1 > x2) {

            let aux = x1;
            x1 = x2;
            x2 = aux;

            aux = y1;
            y1 = y2;
            y2 = aux;
        }

        const dx = x2 - x1;
        const dyOriginal = y2 - y1;

        // Verifica se y cresce ou decresce
        let passoY;

        if (dyOriginal >= 0) {
            passoY = 1;
        } else {
            passoY = -1;
        }

        const dy = Math.abs(dyOriginal);

        let p = 2 * dy - dx;
        let incInf = 2 * dy;
        let incSup = 2 * (dy - dx);

        let x = x1;
        let y = y1;

        adiciona_pixel(x, y);

        while (x < x2) {

            if (p < 0) {
                p = p + incInf;
            }

            else {
                p = p + incSup;
                y = y + passoY;
            }

            x++;

            adiciona_pixel(x, y);
        }
    }
    // m > 1
    else {
        if (y1 > y2) {

            let aux = x1;
            x1 = x2;
            x2 = aux;

            aux = y1;
            y1 = y2;
            y2 = aux;
        }
        const dy = y2 - y1;
        const dxOriginal = x2 - x1;

        let passoX;

        if (dxOriginal >= 0) {
            passoX = 1;
        } else {
            passoX = -1;
        }

        const dx = Math.abs(dxOriginal);
        let p = 2 * dx - dy;
        let incInf = 2 * dx;
        let incSup = 2 * (dx - dy);

        let x = x1;
        let y = y1;

        adiciona_pixel(x, y);

        while (y < y2) {

            if (p < 0) {
                p = p + incInf;

            }

            else {
                p = p + incSup;
                x = x + passoX;
            }
            y++;
            adiciona_pixel(x, y);
        }
    }

    vertices_linha = new Float32Array(verticesLinha);
    colors_linha = new Float32Array(colorsLinha);
    pointSizes_linha = new Float32Array(pointSizesLinha);
}

canvas.addEventListener("mousedown",mouseClick,false);
  
function mouseClick(event){

    // Posição do clique em pixels
    const x = event.offsetX;
    const y = event.offsetY;

    canvasCoordinates.textContent =
        `Canvas: (${x}, ${y})`;

    // Converter X para o intervalo [-1, 1]
    const webglX =
        (x / canvas.width) * 2 - 1;

    // Converter Y para o intervalo [-1, 1]
    // O sinal é invertido porque o eixo Y do canvas
    // cresce para baixo e o do WebGL cresce para cima
    const webglY =
        -((y / canvas.height) * 2 - 1);

    webglCoordinates.textContent =
        `WebGL: (${webglX.toFixed(3)}, ${webglY.toFixed(3)})`;

    if (location_point.length >= 4) {
        location_point.splice(0, 2);
        pixel_point.splice(0, 2);

        vertices_linha = new Float32Array([]);
        colors_linha = new Float32Array([]);
    }

    location_point.push(webglX, webglY);
    pixel_point.push(x, y);

    if (pixel_point.length === 4) {
        bresenham(
            pixel_point[0],
            pixel_point[1],
            pixel_point[2],
            pixel_point[3]
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            pointsLinhaBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            vertices_linha,
            gl.STATIC_DRAW
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            pointsLinhaColorBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            colors_linha,
            gl.STATIC_DRAW
        );

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            LinhaSizeBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            pointSizes_linha,
            gl.STATIC_DRAW
        );
    }

    vertices = new Float32Array(location_point);

    // Atualizar o conteúdo do buffer na GPU
    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        verticesBuffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );
    
    // Redesenhar a cena
    drawScene();
}

// --------------------------------------------------
// 10. INTERAÇÃO COM O TECLADO
// --------------------------------------------------

document.addEventListener(
  "keydown",
  keyboardClick,
  false
);

let color_aux = [1.0, 0.0, 0.0]

function keyboardClick(event) {

  switch(event.key) {
      case "ArrowUp":
        pointSizes_aux += 5.0;
        pointSizes = new Float32Array([pointSizes_aux, pointSizes_aux])
        break;
      case "ArrowDown":
        pointSizes_aux -= 5.0;
        if (pointSizes_aux < 1.0) {
          pointSizes_aux = 1.0;
        }
        pointSizes = new Float32Array([pointSizes_aux, pointSizes_aux])
        break;
      case "0":
          color_aux = [1.0, 1.0, 1.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "white";
          break;

      case "1":
          color_aux = [1.0, 0.0, 0.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "red";
          break;

      case "2":
          color_aux = [0.0, 1.0, 0.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "green";
          break;

      case "3":
          color_aux = [0.0, 0.0, 1.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "blue";
          break;

      case "4":
          color_aux = [1.0, 1.0, 0.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "yellow";
          break;

      case "5":
          color_aux = [1.0, 0.0, 1.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "magenta";
          break;

      case "6":
          color_aux = [0.0, 1.0, 1.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "cyan";
          break;

      case "7":
          color_aux = [1.0, 0.5, 0.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "orange";
          break;

      case "8":
          color_aux = [0.5, 0.0, 1.0];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "purple";
          break;

      case "9":
          color_aux = [1.0, 0.4, 0.7];
          colors = new Float32Array([
              ...color_aux, ...color_aux
          ]);
          colorBox.style.backgroundColor = "pink";
          break;

      default:
          return;
  }

  // Atualizar o buffer de cores
  gl.bindBuffer(
      gl.ARRAY_BUFFER,
      colorsBuffer
  );

  gl.bufferData(
      gl.ARRAY_BUFFER,
      colors,
      gl.STATIC_DRAW
  );

  // Atualizar o buffer de tamanhos dos pontos
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    pointSizesBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    pointSizes,
    gl.STATIC_DRAW
  );

  // Redesenhar
  drawScene();
}

// --------------------------------------------------
// 11. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// 12. DESENHAR
// --------------------------------------------------

const numComponents = 2;

gl.useProgram(program);

function drawScene() {

    gl.useProgram(program);

    gl.clearColor(
        0.0,
        0.0,
        0.0,
        1.0
    );

    gl.clear(gl.COLOR_BUFFER_BIT);

    // DESENHA OS DOIS PONTOS

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        verticesBuffer
    );

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(
        positionLocation
    );

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        colorsBuffer
    );

    gl.vertexAttribPointer(
        colorLocation,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(
        colorLocation
    );


    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        pointSizesBuffer
    );

    gl.vertexAttribPointer(
        pointSizeLocation,
        1,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.enableVertexAttribArray(
        pointSizeLocation
    );


    gl.drawArrays(
        gl.POINTS,
        0,
        vertices.length / 2
    );

    // DESENHA A LINHA DE BRESENHAM

    if (vertices_linha.length > 0) {

        // Posição da linha
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            pointsLinhaBuffer
        );

        gl.vertexAttribPointer(
            positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        // Cor da linha
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            pointsLinhaColorBuffer
        );

        gl.vertexAttribPointer(
            colorLocation,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, LinhaSizeBuffer);

        gl.vertexAttribPointer(
            pointSizeLocation,
            1,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.drawArrays(
            gl.POINTS,
            0,
            vertices_linha.length / 2
        );
    }
}

drawScene();
})();