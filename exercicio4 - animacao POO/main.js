const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_viewTransform;
uniform mat3 u_modelTransform;

void main() {

    vec3 position =
        u_viewTransform *
        u_modelTransform *
        vec3(aPosition, 1.0);

    gl_Position =
        vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {

    outColor =
        vec4(uColor, 1.0);
}
`;

function createShader(gl, type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {

        const error =
            gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}

function createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
) {

    const vertexShader =
        createShader(
            gl,
            gl.VERTEX_SHADER,
            vertexShaderSource
        );

    const fragmentShader =
        createShader(
            gl,
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

    const program =
        gl.createProgram();

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

    gl.linkProgram(program);

    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {

        throw new Error(
            gl.getProgramInfoLog(program)
        );
    }

    return program;
}


const program =
    createProgram(
        gl,
        vertexShaderSource,
        fragmentShaderSource
    );


// ==================================================
// CLASSE RENDERER
// ==================================================

class Renderer {

    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.positionLocation =
            gl.getAttribLocation(
                program,
                "aPosition"
            );

        this.colorLocation =
            gl.getUniformLocation(
                program,
                "uColor"
            );

        this.viewTransformLocation =
            gl.getUniformLocation(
                program,
                "u_viewTransform"
            );

        this.modelTransformLocation =
            gl.getUniformLocation(
                program,
                "u_modelTransform"
            );

        this.viewTransform =
            m3.identity();

        this.verticesBuffer =
            gl.createBuffer();
    }

    defineViewTransform(viewTransform) {
        this.viewTransform =
            viewTransform;
    }

    draw(object) {
        const gl = this.gl;

        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.verticesBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            object.vertices,
            gl.STATIC_DRAW
        );

        gl.enableVertexAttribArray(
            this.positionLocation
        );

        gl.vertexAttribPointer(
            this.positionLocation,
            2,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.uniform3fv(
            this.colorLocation,
            object.color
        );

        gl.uniformMatrix3fv(
            this.modelTransformLocation,
            false,
            object.modelTransform
        );

        gl.uniformMatrix3fv(
            this.viewTransformLocation,
            false,
            this.viewTransform
        );

        gl.drawArrays(
            gl.TRIANGLES,
            0,
            object.vertices.length / 2
        );
    }
}

// ==================================================
// AUXILIARY FUNCTIONS
// ==================================================

function rectangleVertices(x,y,width,height){
    return [
        x, y,
        x+width, y+height,
        x, y+height,

        x, y,
        x+width, y,
        x+width, y+height
    ];
}

function circleVertices(radius,numSegments){
    const vertices = [];

    for (let i = 0; i < numSegments; i++) {
        const theta1 =
            (i / numSegments) *
            2 * Math.PI;

        const theta2 =
            ((i + 1) / numSegments) *
            2 * Math.PI;


        vertices.push(
            0,
            0
        );

        vertices.push(
            radius * Math.cos(theta1),
            radius * Math.sin(theta1)
        );


        vertices.push(
            radius * Math.cos(theta2),
            radius * Math.sin(theta2)
        );
    }

    return vertices;
}

// ==================================================
// ROAD VERTICES
// ==================================================

function roadVertices() {

    const vertices = rectangleVertices(-2.0,-0.4,4.0,0.8);

    return new Float32Array(vertices);
}


// ==================================================
// VERTICES DAS PARTES DO ROBO
// ==================================================

function robotBodyVertices(){
    const vertices = []
    vertices.push(...rectangleVertices(-0.125, 0.0, 0.1, 0.25));
    
    return new Float32Array(vertices)
}

function robotArmVertices(){
    const vertices = []
    vertices.push(...rectangleVertices(-0.025, 0.0, 0.05, -0.2));
    
    return new Float32Array(vertices)
}

function robotHeadVertices(){
    const vertices = []
    vertices.push(...rectangleVertices(-0.075, 0.0, 0.15, 0.15));

    return new Float32Array(vertices)
}

function robotWheelVertices(){
    const vertices = circleVertices(0.075,6);

    return new Float32Array(vertices);
}

function robotEyeVertices(){
    const vertices = []
    vertices.push(...rectangleVertices(-0.025, 0.0, 0.05, 0.05));

    return new Float32Array(vertices);
}

function robotMounthVertices(){
    const vertices = []
    vertices.push(...rectangleVertices(-0.05, 0.0, 0.1, 0.03));

    return new Float32Array(vertices);
}
// ==================================================
// CLASSE SCENE OBJECT
// ==================================================

class SceneObject {

    constructor(vertices, color) {

        this.vertices = vertices;

        this.color = color; 

        this.modelTransform = m3.identity();
    }

    updateModelTransform(modelTransform) {

        this.modelTransform = modelTransform;
    }
}


// ==================================================
// CLASSE ROAD
// ==================================================

class Road extends SceneObject {

    constructor() {

        super(
            roadVertices(),

            new Float32Array([
                0.2,
                0.2,
                0.2
            ])
        );
    }


    draw(renderer) {

        renderer.draw(this);
    }
}


// ==================================================
// CLASSE PARTES DO ROBO
// ==================================================

class RobotBody extends SceneObject {
    
    constructor(xPosition, yPosition, color){
        super(
            robotBodyVertices(),
            color
        )

        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }

    updateModelTransform(robotModelTransform) {

        const localTransform =
            m3.translation(
                this.xPosition,
                this.yPosition
            );

        this.modelTransform =
            m3.multiply(
                robotModelTransform,
                localTransform
            );
    }

    deslocation(deslocamento){
        this.yPosition = -0.03 * Math.sin(Math.PI * deslocamento);
    }
}

class RobotHead extends SceneObject {
    
    constructor(xPosition, yPosition, color){
        super(
            robotHeadVertices(),
            color
        )

        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }

    updateModelTransform(robotModelTransform) {

        const localTransform =
            m3.translation(
                this.xPosition,
                this.yPosition
            );

        this.modelTransform =
            m3.multiply(
                robotModelTransform,
                localTransform
            );
    }

    deslocation(deslocamento){
        this.yPosition = 0.25 + -0.05 * Math.sin(Math.PI * deslocamento);
    }

}

class RobotEye extends SceneObject {
    
    constructor(xPosition, yPosition, color){
        super(
            robotEyeVertices(),
            color
        )

        this.xPosition = xPosition;
        this.yPosition = yPosition;
    }

    updateModelTransform(robotModelTransform) {

        const localTransform =
            m3.translation(
                this.xPosition,
                this.yPosition
            );

        this.modelTransform =
            m3.multiply(
                robotModelTransform,
                localTransform
            );
    }

    deslocation(deslocamento){
        this.yPosition = 0.325 + -0.05 * Math.sin(Math.PI * deslocamento);
    }
}

class RobotMounth extends SceneObject {
    
    constructor(xPosition, yPosition, color){
        super(
            robotMounthVertices(),
            color
        )

        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.deslocationX = 0.05;
    }

    updateModelTransform(robotModelTransform) {

        const localTransform =
            m3.translation(
                this.xPosition,
                this.yPosition
            );

        this.modelTransform =
            m3.multiply(
                robotModelTransform,
                localTransform
            );
    }

    invertDirection(){
        this.xPosition -= this.deslocationX;
        this.deslocationX = -this.deslocationX;
    }

    deslocation(deslocamento){
        this.yPosition = 0.27 + -0.05 * Math.sin(Math.PI * deslocamento);
    }
}

class RobotArm extends SceneObject {

    constructor(xPosition, yPosition, color) {

        super(
            robotArmVertices(),
            color
        );

        this.xPosition = xPosition;
        this.yPosition = yPosition;

        this.theta = 0.0;
        this.angularSpeed = 0.1;
    }

    updateAngularSpeed(angularSpeed) {
        this.angularSpeed = angularSpeed;
    }

    updateRotation(jumping, jumpTime, direction) {
    if (!jumping) {

        this.theta += this.angularSpeed;

        if (this.theta > 0.6 || this.theta < -0.6) {
            this.angularSpeed = -this.angularSpeed;
        }

    } else {

        this.theta = direction * Math.sin(Math.PI * jumpTime) * 2;

    }
    }

    updateModelTransform(robotModelTransform) {

        const localTransform =
            m3.multiply(
                m3.translation(this.xPosition,this.yPosition),
                m3.rotation(this.theta)
            );

        this.modelTransform =
            m3.multiply(
                robotModelTransform,
                localTransform
            );
    }
}

class RobotWheel extends SceneObject {
    constructor(xPosition, angularSpeed) {
        super(
            robotWheelVertices(),
            new Float32Array([
                0.3,
                0.3,
                0.3
            ])
        );
        this.xPosition = xPosition;
        this.theta = 0.0;
        this.angularSpeed = angularSpeed;
    }

    updateAngularSpeed(angularSpeed) {
        this.angularSpeed = angularSpeed;
    }

    updateRotation() {
        this.theta += this.angularSpeed;
    }


    updateModelTransform(carModelTransform) {
        const localTransform =
            m3.multiply(
                m3.translation(this.xPosition,0.0),
                m3.rotation(this.theta)
            );
        this.modelTransform =
            m3.multiply(
                carModelTransform,
                localTransform
            );
    }
}

// ==================================================
// CLASSE ROBO
// ==================================================

class Robot {
    constructor(tx, ty, color, speed) {
        this.tx = tx;
        this.ty = ty;
        this.speed = speed;
        this.angularSpeed = 0.1;
        this.Body = new RobotBody(0.0, 0.0, new Float32Array([0.8, 0.8, 0.8]));
        this.Arm = new RobotArm(-0.075, 0.2, new Float32Array([0.6, 0.6, 0.6]));
        this.Head = new RobotHead(-0.075, 0.25, new Float32Array([0.6, 0.6, 0.6]));
        this.Wheel = new RobotWheel(-0.075, 0.1);
        this.Eye = new RobotEye(-0.075, 0.325, new Float32Array([1.0, 0.4, 0.4]))
        this.Mounth = new RobotMounth(-0.05, 0.27, new Float32Array([0.3, 0.3, 0.3]))
        this.jumping = false;
        this.jumpTime = 0.02;
        this.preparingJump = false;
        this.prepareTime = 0.0;
    }

    move() {
        this.tx += this.speed;
        if ( this.tx > 1.8 || this.tx < -1.8) {
            this.speed = -this.speed;
            this.angularSpeed = -this.angularSpeed;
            this.Wheel.updateAngularSpeed(this.angularSpeed)
            this.Arm.updateAngularSpeed(this.angularSpeed)

            this.Mounth.invertDirection();
        }

        if (!this.jumping && !this.preparingJump && this.tx > 0.04 && this.tx < 0.08) {
            this.preparingJump = true;
            this.prepareTime = 0.0;
        }

        if (this.preparingJump) {
            this.prepareJump();
        } else if (this.jumping) {
            this.jump();
        }

        const robotTransform = m3.translation(this.tx,this.ty);
        
        this.Wheel.updateRotation();
        this.Wheel.updateModelTransform(robotTransform);
        
        this.Body.updateModelTransform(robotTransform);
        this.Head.updateModelTransform(robotTransform);

        this.Arm.updateRotation(this.jumping, this.jumpTime, Math.sign(this.speed));
        this.Arm.updateModelTransform(robotTransform);

        this.Eye.updateModelTransform(robotTransform);
        this.Mounth.updateModelTransform(robotTransform);
    }

    prepareJump() {
        this.prepareTime += 0.05;

        this.Body.deslocation(this.prepareTime);
        this.Head.deslocation(this.prepareTime);
        this.Eye.deslocation(this.prepareTime);
        this.Mounth.deslocation(this.prepareTime);

        if (this.prepareTime >= 1.0) {
            this.preparingJump = false;
            this.jumping = true;
            this.jumpTime = 0.0;
            this.ty = 0.0;
        }
    }

    jump(){
        
        this.ty = 1.5 * this.jumpTime * (1 - this.jumpTime);
        this.jumpTime += 0.015;

        if (this.jumpTime >= 1.0) {
            this.jumping = false;
            this.jumpTime = 0.0;
            this.ty = 0.0;  
            this.Arm.updateAngularSpeed(this.angularSpeed);

        }

    }

    draw(renderer) {
        renderer.draw(this.Body);
        renderer.draw(this.Head);
        renderer.draw(this.Wheel)
        renderer.draw(this.Arm);
        renderer.draw(this.Eye);
        renderer.draw(this.Mounth);
    }
}

// ==================================================
// CLASSE SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl,program);

        this.viewTransform = m3.setClippingWindow(-2.0,-1.0,2.0,1.0);

        this.renderer.defineViewTransform(this.viewTransform);

        this.road = new Road();

        this.robot = new Robot(0.0, 0.0, new Float32Array([1.0, 0.1, 0.1]), 0.01);
    }

    update() {

        this.robot.move();
    }

    draw() {

        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        this.road.draw(this.renderer);

        this.robot.draw(this.renderer);
    }

    execute() {

        this.update();

        this.draw();

        requestAnimationFrame(() => this.execute());
    }

    init() {

        requestAnimationFrame(() => this.execute());
    }
}


// ==================================================
// CONFIGURAÇÃO INICIAL DO WEBGL
// ==================================================

gl.clearColor(
    0.1,
    0.1,
    0.1,
    1.0
);

gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);


// ==================================================
// CRIAR CENA
// ==================================================

const scene =
    new Scene(gl,program);


// ==================================================
// INICIAR ANIMAÇÃO
// ==================================================

scene.init();