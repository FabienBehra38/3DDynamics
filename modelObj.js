var modelShader;

function initModelShader() {
    modelShader = initShaders("model-vs", "model-fs");

    // active ce shader
    gl.useProgram(modelShader);

    // adresse de la variable uniforme uOffset dans le shader
    modelShader.modelMatrixUniform = gl.getUniformLocation(modelShader, "uModelMatrix");
    modelShader.viewMatrixUniform = gl.getUniformLocation(modelShader, "uViewMatrix");
    modelShader.projMatrixUniform = gl.getUniformLocation(modelShader, "uProjMatrix");

}

function Model(filename, ennemy) {
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 0;
    this.vertexBuffer.numItems = 0;

    this.normalBuffer = gl.createBuffer();
    this.normalBuffer.itemSize = 0;
    this.normalBuffer.numItems = 0;

    this.bbmin = [0, 0, 0];
    this.bbmax = [0, 0, 0];

    this.bbminP = [0, 0, 0, 0];
    this.bbmaxP = [0, 0, 0, 0];
    this.loaded = false;

    this.deepLookAt = 10;
    this.ennemy = ennemy;

    this.load(filename);
}

Model.prototype.computeBoundingBox = function (vertices) {
    var i, j;

    if (vertices.length >= 3) {
        this.bbmin = [vertices[0], vertices[1], vertices[2]];
        this.bbmax = [vertices[0], vertices[1], vertices[2]];
    }

    for (i = 3; i < vertices.length; i += 3) {
        for (j = 0; j < 3; j++) {
            if (vertices[i + j] > this.bbmax[j]) {
                this.bbmax[j] = vertices[i + j];
            }

            if (vertices[i + j] < this.bbmin[j]) {
                this.bbmin[j] = vertices[i + j];
            }
        }
    }
}

Model.prototype.handleLoadedObject = function (objData) {
    var vertices = objData[0];
    var normals = objData[1];


    this.computeBoundingBox(vertices);
    // console.log("BBox min: "+this.bbmin[0]+","+this.bbmin[1]+","+this.bbmin[2]);
    // console.log("BBox max: "+this.bbmax[0]+","+this.bbmax[1]+","+this.bbmax[2]);

    this.initParameters();

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // cree un nouveau buffer sur le GPU et l'active
    this.vertexBuffer = gl.createBuffer();
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.numItems = vertices.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);


    this.normalBuffer = gl.createBuffer();
    this.normalBuffer.itemSize = 3;
    this.normalBuffer.numItems = normals.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.enableVertexAttribArray(1);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);


    gl.bindVertexArray(null);

    console.log("model initialized");
    this.loaded = true;
}

/**
 * Déclenche un tir normal
 */
Model.prototype.shoot = function(){
    const time = new Date().getTime();
    let timeLastShoot = (this.ennemy) ? PeakatimeLastNormalShoot : timeLastNormalShoot;
    if(time-timeLastShoot > this.intervalNormalShoot){
        var splat = (this.ennemy)
                        ? new Splat(0, 'bas', this)
                        : new Splat(0, 'haut', this);

        splatsArray.push(splat);
        const frontObj = this.getBBox();
        splat.setPosition((frontObj[0][0] + frontObj[1][0]) / 2, frontObj[0][1]);
        splat.setPosDebut(frontObj[0][1]);

        (this.ennemy) ? PeakatimeLastNormalShoot = new Date().getTime(): timeLastNormalShoot  = new Date().getTime();
    }

    refreshInterface();
};

/**
 * Déclenche un tir spécial
 */
Model.prototype.shootSpecial = function() {
    const time = new Date().getTime();
    let lastSpecialShoot = (this.ennemy) ? PeakatimeLastSpecialShoot : timeLastSpecialShoot;

    if(time - lastSpecialShoot >= this.intervalSpecialShoot){
        specialShoot = (this.ennemy)
            ? [new Splat(0, 'bas', this), new Splat(0, 'basG', this), new Splat(0, 'basD', this)]
            : [new Splat(0, 'haut', this), new Splat(0, 'hautG', this), new Splat(0, 'hautD', this)];

        const frontObj = this.getBBox();
        for (let i = 0; i < specialShoot.length; i++) {
            specialShoot[i].setPosition((frontObj[0][0] + frontObj[1][0]) / 2, frontObj[0][1]);
            specialShoot[i].setPosDebut(frontObj[0][1]);
        }

        (this.ennemy) ? PeakatimeLastSpecialShoot = new Date().getTime(): timeLastSpecialShoot  = new Date().getTime();
    }

    refreshInterface();
};


Model.prototype.initParameters = function () {
    this.setInclinaison(0, 0);
    this.currentTransform = mat4.identity();
    this.modelMatrix = mat4.identity();
    this.viewMatrix = mat4.identity();
    this.projMatrix = mat4.identity();

    if (this.ennemy) {
        this.translation = [-3, 0, 0];
        this.rotation = 1.5;
    } else {
        this.translation = [3, 0, 0];
        this.rotation = 0;
    }
    // this.rotation = 0;
    //set parameters player
    this.MAX_PV = 100;
    this.pv = this.MAX_PV;
    this.intervalNormalShoot = INTERVAL_NORMAL_SHOOT;
    this.intervalSpecialShoot = INTERVAL_SPECIAL_SHOOT;
    this.currentBonus = "";
    this.timeLastBonus = new Date().getTime()-TIME_BONUS;

    // trouver les model/view/proj matrices pour voir l'objet comme vous le souhaitez
    if (this.ennemy) {
        this.modelMatrix = mat4.scale(this.modelMatrix, [0.01, 0.01, 0.01]);
    } else {
        this.modelMatrix = mat4.scale(this.modelMatrix, [0.1, 0.1, 0.1]);
    }
    //this.viewMatrix = lookAt(eye,center,up,dest);
    this.viewMatrix = mat4.lookAt([0, this.deepLookAt, 0], [0, 0, 0], [-1, 0, 0]);
    this.projMatrix = mat4.perspective(45.0, 1, 0.1, 30);
}

Model.prototype.setParameters = function (elapsed) {
    // on pourrait animer des choses ici
}

Model.prototype.hitted = function () {
    this.pv -= 10;
}
Model.prototype.isDead = function () {
    return this.pv <= 0;
}

Model.prototype.move = function (x, y) {

    if (this.ennemy) {
        if (y > 0) {
            if ((this.getBBox()[0][0]) < 0.78) {
                this.translate(this.translation[0], 0, this.translation[2] - y);
            }
        }
        //Deplacement a gauche
        else if (y < 0) {
            if ((this.getBBox()[1][0]) > -0.85) {
                this.translate(this.translation[0], 0, this.translation[2] - y);
            }
        }
        //Deplacement en haut
        else if (x > 0) {
            if ((this.getBBox()[0][1]) < 0.95) {
                this.translate(this.translation[0] - x, 0, this.translation[2]);
            }
        }
        //Deplacement en bas
        else {
            if ((this.getBBox()[1][1]) > 0.15) {
                this.translate(this.translation[0] - x, 0, this.translation[2]);
            }
        }
    } else {
        if (y > 0) {
            if ((this.getBBox()[0][0]) < 0.89) {
                this.translate(this.translation[0], 0, this.translation[2] - y);
            }
            this.rotate(-0.2);
        }
        //Deplacement a gauche
        else if (y < 0) {
            if ((this.getBBox()[1][0]) > -1) {
                this.translate(this.translation[0], 0, this.translation[2] - y);
            }
            this.rotate(0.1);
        }
        //Deplacement en haut
        else if (x > 0) {
            if ((this.getBBox()[0][1]) < 0) {
                this.translate(this.translation[0] - x, 0, this.translation[2]);
            }
        }
        //Deplacement en bas
        else {
            if ((this.getBBox()[1][1]) > -1) {
                this.translate(this.translation[0] - x, 0, this.translation[2]);
            }
        }
    }

}

Model.prototype.resize = function (factor) {
    //pour des raisons étrange, il diminiue de base par 10 donc on fait *10

    if (this.ennemy) {
        factor *= 100;
        this.modelMatrix = mat4.scale(this.modelMatrix, [0.01*factor, 0.01*factor, 0.01*factor]);
        console.log(this.modelMatrix);
    } else {
        factor *= 10;
        this.modelMatrix = mat4.scale(this.modelMatrix, [0.1*factor, 0.1*factor, 0.1*factor]);
        console.log(this.modelMatrix);
    }

}

Model.prototype.translate = function (x, y, z) {
    this.translation = [x, y, z];
}

Model.prototype.rotate = function (x) {
    this.rotation += x;
    if (this.rotation > 0.75) {
        this.rotation = 0.75;
    } else if (this.rotation < -0.75) {
        this.rotation = -0.75;
    }
}
Model.prototype.resetRotation = function () {
    if (this.rotation < 0) {
        this.rotate(0.01);
    } else if (this.rotation > 0) {
        this.rotate(-0.01);
    }
}


Model.prototype.setInclinaison = function (x, y) {
    this.inclinaison = [x, y];
}

Model.prototype.getBBox = function () {
    return [this.bbminP, this.bbmaxP];
}

Model.prototype.getZ = function () {
    console.log("bbmin :" + this.bbminP);
    console.log("bbmax :" + this.bbmaxP);
    return [this.bbminP[2]];
}


Model.prototype.sendUniformVariables = function () {
    if (this.loaded) {
        var rMat = mat4.create();
        var tMat = mat4.create()
        if (this.ennemy) {
            mat4.rotate(mat4.identity(), this.rotation, [0, 1, 0], rMat);
        } else {
            mat4.rotate(mat4.identity(), this.rotation, [1, 0, 0], rMat);
        }
        mat4.translate(mat4.identity(), this.translation, tMat);
        mat4.multiply(tMat, rMat, this.currentTransform);

        var m = mat4.create();
        var v = this.viewMatrix;
        var p = this.projMatrix;
        mat4.multiply(this.currentTransform, this.modelMatrix, m);
        // envoie des matrices aux GPU
        gl.uniformMatrix4fv(modelShader.modelMatrixUniform, false, m);
        gl.uniformMatrix4fv(modelShader.viewMatrixUniform, false, this.viewMatrix);
        gl.uniformMatrix4fv(modelShader.projMatrixUniform, false, this.projMatrix);

        // calcul de la boite englobante (projetée)
        mat4.multiplyVec4(m, [this.bbmin[0], this.bbmin[1], this.bbmin[2], 1], this.bbminP);
        mat4.multiplyVec4(m, [this.bbmax[0], this.bbmax[1], this.bbmax[2], 1], this.bbmaxP);
        mat4.multiplyVec4(v, this.bbminP);
        mat4.multiplyVec4(v, this.bbmaxP);
        mat4.multiplyVec4(p, this.bbminP);
        mat4.multiplyVec4(p, this.bbmaxP);

        this.bbminP[0] /= this.bbminP[3];
        this.bbminP[1] /= this.bbminP[3];
        this.bbminP[2] /= this.bbminP[3];
        this.bbminP[3] /= this.bbminP[3];

        this.bbmaxP[0] /= this.bbmaxP[3];
        this.bbmaxP[1] /= this.bbmaxP[3];
        this.bbmaxP[2] /= this.bbmaxP[3];
        this.bbmaxP[3] /= this.bbmaxP[3];

        if (!this.ennemy) {
            this.resetRotation();
        }


    }
}

Model.prototype.shader = function () {
    return modelShader;
}

Model.prototype.draw = function () {
    if (this.loaded) {
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems)
        gl.bindVertexArray(null);
    }
}

Model.prototype.clear = function () {
    // clear all GPU memory
    gl.deleteBuffer(this.vertexBuffer);
    gl.deleteBuffer(this.normalBuffer);
    gl.deleteVertexArray(this.vao);
    this.loaded = false;
}

Model.prototype.load = function (filename) {
    var vertices = null;
    var xmlhttp = new XMLHttpRequest();
    var instance = this;

    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == XMLHttpRequest.DONE) {

            if (xmlhttp.status == 200) {

                var data = xmlhttp.responseText;

                var lines = data.split("\n");

                var positions = [];
                var normals = [];
                var arrayVertex = []
                var arrayNormal = [];

                for (var i = 0; i < lines.length; i++) {
                    var parts = lines[i].trimRight().split(' ');
                    if (parts.length > 0) {
                        switch (parts[0]) {
                            case 'v':
                                positions.push(
                                    vec3.create([
                                        parseFloat(parts[1]),
                                        parseFloat(parts[2]),
                                        parseFloat(parts[3])]
                                    ));
                                break;
                            case 'vn':
                                normals.push(
                                    vec3.create([
                                        parseFloat(parts[1]),
                                        parseFloat(parts[2]),
                                        parseFloat(parts[3])]
                                    ));
                                break;
                            case 'f': {
                                var f1 = parts[1].split('/');
                                var f2 = parts[2].split('/');
                                var f3 = parts[3].split('/');
                                Array.prototype.push.apply(arrayVertex, positions[parseInt(f1[0]) - 1]);
                                Array.prototype.push.apply(arrayVertex, positions[parseInt(f2[0]) - 1]);
                                Array.prototype.push.apply(arrayVertex, positions[parseInt(f3[0]) - 1]);

                                Array.prototype.push.apply(arrayNormal, normals[parseInt(f1[2]) - 1]);
                                Array.prototype.push.apply(arrayNormal, normals[parseInt(f2[2]) - 1]);
                                Array.prototype.push.apply(arrayNormal, normals[parseInt(f3[2]) - 1]);
                                break;
                            }
                            default:
                                break;
                        }
                    }
                }

                var objData = [
                    new Float32Array(arrayVertex),
                    new Float32Array(arrayNormal)
                ]
                instance.handleLoadedObject(objData);

            }
        }
    };

    console.log("Loading Ennemy <" + filename + ">...");

    xmlhttp.open("GET", filename, true);
    xmlhttp.send();
}
