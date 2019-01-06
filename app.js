function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if (xhr.status === 200) {
        return xhr.responseText;
    } else {
        return null;
    }
}

var canvas;
var gl;
var program;
var vertexShader;
var fragmentShader;
var attribPosition;
var attribColor;
var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
var xRotationMatrix = new Float32Array(16);
var yRotationMatrix = new Float32Array(16);
var zRotationMatrix = new Float32Array(16);
var identityMatrix = new Float32Array(16);
var matWorldUniformLocation;
var matViewUniformLocation;
var matProjdUniformLocation;
var angleRot = Math.PI;


var holdRotationx = document.getElementById('rotationX');
var holdRotationy = document.getElementById('rotationY');
var holdRotationz = document.getElementById('rotationZ');
var holdTranslationx = document.getElementById('translationX');
var holdTranslationy = document.getElementById('translationY');
var holdTranslationz = document.getElementById('translationZ');
var holdZoom = document.getElementById('zoom');
var holdPerspective = document.getElementById('perspective');
var resetSettings = document.getElementById('resetSettings');
var parentNodeElements = document.querySelector('.slidecontainer');



var boxVertices =
    [ // X, Y, Z           R, G, B
        // Top
        -1.0, 1.0, -1.0, 0.5, 0.5, 0.5,
        -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
        1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
        1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

        // Left
        -1.0, 1.0, 1.0, 0.75, 0.25, 0.5,
        -1.0, -1.0, 1.0, 0.75, 0.25, 0.5,
        -1.0, -1.0, -1.0, 0.75, 0.25, 0.5,
        -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,

        // Right
        1.0, 1.0, 1.0, 0.25, 0.25, 0.75,
        1.0, -1.0, 1.0, 0.25, 0.25, 0.75,
        1.0, -1.0, -1.0, 0.25, 0.25, 0.75,
        1.0, 1.0, -1.0, 0.25, 0.25, 0.75,

        // Front
        1.0, 1.0, 1.0, 1.0, 0.0, 0.15,
        1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
        -1.0, 1.0, 1.0, 1.0, 0.0, 0.15,

        // Back
        1.0, 1.0, -1.0, 0.0, 1.0, 0.15,
        1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
        -1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
        -1.0, 1.0, -1.0, 0.0, 1.0, 0.15,

        // Bottom
        -1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
        -1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
        1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
        1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
    ];

var boxIndices =
    [
        // Top
        0, 1, 2,
        0, 2, 3,

        // Left
        5, 4, 6,
        6, 4, 7,

        // Right
        8, 9, 10,
        8, 10, 11,

        // Front
        13, 12, 14,
        15, 14, 12,

        // Back
        16, 17, 18,
        16, 18, 19,

        // Bottom
        21, 20, 22,
        22, 20, 23
    ];


function initContext() {
    canvas = document.getElementById('webgl-canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Votre navigateur ne supporte pas le webgl');
    }
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
}


function initShaders() {
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    var vertexShaderText = loadText('https://astero-h.github.io/WebGl_renduTP/vertexShader.glsl');
    var fragmentShaderText = loadText('https://astero-h.github.io/WebGl_renduTP/fragmentShader.glsl');

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Erreur de compilation du vertex shader', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Erreur de compilation du fragment shaderr', gl.getShaderInfoLog(fragmentShader));
        return;
    }
}


function initBuffers() {
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
}


function initAttributes() {
    attribPosition = gl.getAttribLocation(program, 'vertPosition');
    attribColor = gl.getAttribLocation(program, 'vertColor');
    matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    matProjdUniformLocation = gl.getUniformLocation(program, 'mProj');

    gl.vertexAttribPointer(
        attribPosition, // attribute location
        3, // number of element per attribute
        gl.FLOAT, 
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        0 
    );

    gl.vertexAttribPointer(
        attribColor, 
        3, 
        gl.FLOAT,
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );

    gl.enableVertexAttribArray(attribPosition);
    gl.enableVertexAttribArray(attribColor);
}

function renderScene() {
    var zoom = holdZoom.value;
    var perspective = holdPerspective.value;
    
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [perspective, perspective, 30], [0,0,0], [0, 1, 0]);
    mat4.perspective(projMatrix, zoom * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 1000);

    console.log(zoom);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjdUniformLocation, gl.FALSE, projMatrix);
    mat4.identity(identityMatrix);

    //rotation 
    mat4.fromXRotation(xRotationMatrix, holdRotationx.value / angleRot);
    mat4.fromYRotation(yRotationMatrix, holdRotationy.value / angleRot);
    mat4.fromZRotation(zRotationMatrix, holdRotationz.value / angleRot);

    //translation   
    var translationMatrix = mat4.create();
    var translation = vec3.create();
    vec3.set(translation, holdTranslationx.value/2, holdTranslationy.value/2.5, holdTranslationz.value/2);
    //console.log(holdTranslationx.value);
    mat4.translate(translationMatrix, translationMatrix, translation);

    //render
    worldMatrix = mat4.clone(translationMatrix);
    mat4.mul(worldMatrix, worldMatrix, xRotationMatrix);
    mat4.mul(worldMatrix, worldMatrix, yRotationMatrix);
    mat4.mul(worldMatrix, worldMatrix, zRotationMatrix);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix); 
}

function programProcess() {
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Erreur de validation du programme!', gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);
}

function drawElems() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.DEPTH_BUFFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
}

//render loop
function main() {
    initContext();
    initShaders();
    initBuffers();
    programProcess();
    initAttributes();
    renderScene();
    drawElems();
}

//events 
parentNodeElements.oninput = function (e) {
    if (e.target !== e.currentTarget) {
        renderScene();
        drawElems();
    }
};

//reset
resetSettings.onclick = function () {
    var sliderButtons = document.querySelectorAll(
        '#rotationX , #rotationY ,#rotationZ ,' +
        '#translationX,#translationY,#translationZ,'+
        '#perspective'
    );

    for (i = 0; i < sliderButtons.length; i++) {
        sliderButtons[i].value = 0;
    }
    holdZoom.value = 24;


    renderScene();
    drawElems();
};









