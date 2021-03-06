var splatShader;
var model;

function initSplatShader() {
    splatShader = initShaders("splat-vs", "splat-fs");

    // active ce shader
    gl.useProgram(splatShader);

    // adresse de la texture uHeightfield dans le shader
    splatShader.positionUniform = gl.getUniformLocation(splatShader, "uPosition");
    splatShader.texUniform = gl.getUniformLocation(splatShader, "uTex");

}

function Splat(textureFileName, deplacement = 'haut', player) {
    this.player = player;
    this.deplacement = deplacement;
    this.initParameters();

    var wo2 = 0.5 * this.width;
    var ho2 = 0.5 * this.height;

    // un tableau contenant les positions des sommets (sur CPU donc)
    var vertices = [
        -wo2, -ho2, 0.8,
        wo2, -ho2, 0.8,
        wo2, ho2, 0.8,
        -wo2, ho2, 0.8
    ];

    var coords = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];

    var tri = [0, 1, 2, 0, 2, 3];


    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // cree un nouveau buffer sur le GPU et l'active
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.numItems = 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // meme principe pour les coords
    this.coordBuffer = gl.createBuffer();
    this.coordBuffer.itemSize = 2;
    this.coordBuffer.numItems = 4;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer);
    gl.enableVertexAttribArray(1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, this.coordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // creation des faces du cube (les triangles) avec les indices vers les sommets
    this.triangles = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangles);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(tri), gl.STATIC_DRAW);
    this.triangles.numItems = 6;

    gl.bindVertexArray(null);

    this.loaded = true;

}

Splat.prototype.shader = function () {
    return splatShader;
}

Splat.prototype.initParameters = function () {
    this.width = 0.05;
    this.height = 0.05;
    this.position = [0.0, -0.7];

    this.splatTexture = initTexture("assets/splat.png");
    // we could init some params here 
}

Splat.prototype.setPosition = function (x, y) {
    this.position = [x, y];
}

Splat.prototype.setParameters = function () {
    // we could animate something here

    switch (this.deplacement) {
        case 'haut':
            this.position[1] += 0.04;
            break;
        case 'bas':
            this.position[1] += -0.04;
            break;
        case 'hautD':
            this.position[1] += 0.04;
            this.position[0] += 0.01;
            break;
        case 'hautG':
            this.position[1] += 0.04;
            this.position[0] += -0.01;
            break;
        case 'basD':
            this.position[1] += -0.04;
            this.position[0] += 0.01;
            break;
        case 'basG':
            this.position[1] += -0.04;
            this.position[0] += -0.01;
            break;
        default:
            console.warn('deplacement splat unknow');
    }

}


Splat.prototype.setSpecialParametersLeft = function (elapsed) {
    // we could animate something here

}

Splat.prototype.sendUniformVariables = function () {
    if (this.loaded) {
        gl.uniform2fv(splatShader.positionUniform, this.position);

        // how to send a texture:
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.splatTexture);
        gl.uniform1i(splatShader.texUniform, 0);
    }
}

Splat.prototype.draw = function () {
    if (this.loaded) {
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0.5);
        gl.bindVertexArray(null);
    }
};

Splat.prototype.collision = function (tabPlayers) {
    //[0] => pikachu
    //[1] => spaceship
    for (var i = 0; i < tabPlayers.length; i++) {
        if (tabPlayers[i] != this.player) { // si le joueur courant n'est pas celui qui a tiré le splat
            let pos = tabPlayers[i].getBBox();
            if(this.player.ennemy){ // si c'est le pikachu
                if (this.position[0] > pos[1][0] && this.position[0] < pos[0][0] // si splat[x] est compris en obj[xMin] et obj[xMax]
                    && this.position[1] > pos[1][1] && this.position[1] < pos[0][1]) { //HitBox en 3D à changé !!!!!
                    return tabPlayers[i];
                }
            }else{
                if (this.position[0] > pos[0][0] && this.position[0] < pos[1][0] // si splat[x] est compris en obj[xMin] et obj[xMax]
                    && this.position[1] > pos[1][1] && this.position[1] < pos[0][1]) { //HitBox en 3D à changé !!!!!
                    return tabPlayers[i];
                }
            }

        }
    }

    return null;
};


Splat.prototype.clear = function () {
    // clear all GPU memory
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.coordBuffer);
    gl.deleteVertexArray(this.vao);
    this.loaded = false;
};

Splat.prototype.getPosX = function () {
    return this.position[1];
};

Splat.prototype.getPos = function () {
    return this.position;
};

Splat.prototype.setPosDebut = function (pos) {
    this.posDebut = pos
};
Splat.prototype.getPosDebut = function () {
    return this.posDebut;
};
