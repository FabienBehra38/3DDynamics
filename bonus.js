var splatShader;

function initBonusShader() {
    splatShader = initShaders("splat-vs", "splat-fs");

    // active ce shader
    gl.useProgram(splatShader);

    // adresse de la texture uHeightfield dans le shader
    splatShader.positionUniform = gl.getUniformLocation(splatShader, "uPosition");
    splatShader.texUniform = gl.getUniformLocation(splatShader, "uTex");

}

function Bonus(type) {
    this.type = type;
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

Bonus.prototype.shader = function () {
    return splatShader;
}

Bonus.prototype.initParameters = function () {
    this.width = 0.08;
    this.height = 0.08;

    switch (this.type) {
        case "heal":
            this.splatTexture = initTexture("assets/health.png");
            break;
        case "resize":
            this.splatTexture = initTexture("assets/resize.png");
            break;
        case "reloadSpecialShoot":
            this.splatTexture = initTexture("assets/reloadSpecialShoot.png");
            break;
        case "reloadNormalShoot":
            this.splatTexture = initTexture("assets/reloadNormalShoot.png");
            break;
    }

}

Bonus.prototype.setPosition = function (x, y) {
    this.position = [x, y];
}

Bonus.prototype.setParameters = function (elapsed) {
    // we could animate something here
    this.position[0] += 0.01;
}

Bonus.prototype.sendUniformVariables = function () {
    if (this.loaded) {
        gl.uniform2fv(splatShader.positionUniform, this.position);

        // how to send a texture:
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.splatTexture);
        gl.uniform1i(splatShader.texUniform, 0);
    }
}

Bonus.prototype.draw = function () {
    if (this.loaded) {
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.triangles.numItems, gl.UNSIGNED_SHORT, 0.5);
        gl.bindVertexArray(null);
    }
};

Bonus.prototype.collision = function (tabEnnemy) {
    for (var i = 0; i < tabEnnemy.length; i++) {
        let pos = tabEnnemy[i].getBBox();
        if(tabEnnemy[i] === ennemy) { // si c'est le pikachu
            if (this.position[0] + this.width / 2 > pos[0][0] && this.position[0] - this.width / 2 < pos[1][0] && this.position[1] + this.width / 2 > pos[1][1] && this.position[1] - this.width / 2 < pos[0][1]) {
                return tabEnnemy[i];
            }
        } else {
            if (this.position[0] + this.width / 2 > pos[1][0] && this.position[0] - this.width / 2 < pos[0][0] && this.position[1] + this.width / 2 > pos[1][1] && this.position[1] - this.width / 2 < pos[0][1]) {
                return tabEnnemy[i];
            }
        }
    }
    return null;
};


Bonus.prototype.clear = function () {
    // clear all GPU memory
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.coordBuffer);
    gl.deleteVertexArray(this.vao);
    this.loaded = false;
};

Bonus.prototype.getPosX = function () {
    return this.position[1];
};

Bonus.prototype.getPosY = function () {
    return this.position[0];
}


Bonus.prototype.setPosDebut = function (pos) {
    this.posDebut = pos
};

Bonus.prototype.getType = function () {
    return this.type;
}
