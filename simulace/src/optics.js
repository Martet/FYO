class OpticElement {
    constructor(pos) {
        this.pos = pos;
    }

    transform(ray) {
        return new Float32Array([
            this.matrix[0] * ray[0] + this.matrix[1] * ray[1],
            this.matrix[2] * ray[0] + this.matrix[3] * ray[1]
        ]);
    }

    draw() {console.log(this.constructor.name + ': draw not implemented');}
}

class FreeSpaceElement extends OpticElement {
    constructor(length, pos) {
        super(pos);
        this.length = length;
        this.n = 1;
        this.matrix = new Float32Array([1, length, 0, 1]);
    }

    draw(ctx) {
        if (this.n > 1) {
            let color = (1 - (this.n - 1)) * 255;
            ctx.fillStyle = `rgb(${color} ${color} 255)`;
        } else {
            let color = this.n * 255;
            ctx.fillStyle = `rgb(${color} 255 ${color})`;
        }
        ctx.fillRect(this.pos, 0, this.pos + this.length, 250);
    }
}

class FlatRefractionElement extends OpticElement {
    constructor(n1, n2, pos) {
        super(pos);
        this._n1 = n1;
        this._n2 = n2;
        this.matrix = new Float32Array([1, 0, 0, this._n1 / this._n2]);
    }

    set n1(n1) {
        this._n1 = n1;
        this.matrix = new Float32Array([1, 0, 0, this._n1 / this._n2]);
    }
    set n2(n2) {
        this._n2 = n2;
        this.matrix = new Float32Array([1, 0, 0, this._n1 / this._n2]);
    }
    get n1() {
        return this._n1;
    }
    get n2() {
        return this._n2;
    }


    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.pos, 10);
        ctx.lineTo(this.pos, 240);
        ctx.stroke();
    }
}

class CurvedRefractionElement extends OpticElement {
    constructor(n1, n2, R, pos) {
        super(pos);
        this._n1 = n1;
        this._n2 = n2;
        this._r = R;
        this.matrix = new Float32Array([1, 0, (this._n1 - this._n2) / this._r * this._n2, this._n1 / this._n2]);
    }

    set n1(n1) {
        this._n1 = n1;
        this.matrix = new Float32Array([1, 0, (this._n1 - this._n2) / this._r * this._n2, this._n1 / this._n2]);
    }
    set n2(n2) {
        this._n2 = n2;
        this.matrix = new Float32Array([1, 0, (this._n1 - this._n2) / this._r * this._n2, this._n1 / this._n2]);
    }
    set r(r) {
        this._r = r;
        this.matrix = new Float32Array([1, 0, (this._n1 - this._n2) / this._r * this._n2, this._n1 / this._n2]);
    }
    get n1() {
        return this._n1;
    }
    get n2() {
        return this._n2;
    }


    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.pos, 10);
        ctx.lineTo(this.pos, 240);
        ctx.stroke();
        ctx.beginPath();
        let arrowOffset = this._r > 0 ? 5 : -5;
        ctx.moveTo(this.pos + arrowOffset, 5);
        ctx.lineTo(this.pos, 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.pos + arrowOffset, 245);
        ctx.lineTo(this.pos, 240);
        ctx.stroke();
    }
}

class ThinLensElement extends OpticElement {
    constructor(f, pos) {
        super(pos);
        this._f = f;
        this.matrix = new Float32Array([1, 0, -1 / f, 1]);
    }

    set f(f) {
        this._f = f;
        this.matrix = new Float32Array([1, 0, -1 / f, 1]);
    }
    get f() {
        return this._f;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.pos, 10);
        ctx.lineTo(this.pos, 240);
        ctx.stroke();
        ctx.beginPath();
        let arrowOffset = this.f > 0 ? 5 : -5;
        ctx.moveTo(this.pos - 5, 10 + arrowOffset);
        ctx.lineTo(this.pos, 10);
        ctx.lineTo(this.pos + 5, 10 + arrowOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.pos - 5, 240 - arrowOffset);
        ctx.lineTo(this.pos, 240);
        ctx.lineTo(this.pos + 5, 240 - arrowOffset);
        ctx.stroke();
    }
}

class ThickLensElement extends OpticElement {
    constructor(n1, n2, r1, r2, t, pos) {
        super(pos);
        this.n1 = n1;
        this.n2 = n2;
        this.r1 = r1;
        this.r2 = r2;
        this.t = t;
    }
}

function renderRay(ctx, ray, elements) {
    let currX = 0;
    ctx.beginPath();
    ctx.moveTo(currX, 125 + ray[0]);

    for (let i = 0; i < elements.length; i++) {
        ray = elements[i].transform(ray);
        if (elements[i].constructor.name === 'FreeSpaceElement') {
            currX += elements[i].length;
            ctx.lineTo(currX, 125 + ray[0]);
            if (125 + ray[0] < 0 || 125 + ray[0] > 250) {
                break;
            }
        }
    }

    ctx.stroke();
}

