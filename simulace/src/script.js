var ctx;
window.onload = function() {
    const canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    loadPreset('achromat');
    render();
};

function render() {
    ctx.clearRect(0, 0, 500, 250);
    let elements = populateSpace(userElements);
    for (let e of elements) {
        if (e.constructor.name === 'FreeSpaceElement') {
            e.draw(ctx);
        }
    }
    ctx.lineWidth = 2;
    for (let e of elements) {
        if (e.constructor.name !== 'FreeSpaceElement') {
            e.draw(ctx);
        }
    }
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(0, 125);
    ctx.lineTo(500, 125);
    ctx.stroke();
    ctx.setLineDash([]);
    
    for (let prop in rays) {
        renderRay(ctx, rays[prop], elements);
    }
}

var userElements = {}, domElements = {}, rays = {}, rayElements = {};
var id = 0;
function createOpticalElement(type) {
    let element;
    let domElement = document.createElement('div');
    domElement.classList.add('element-container');
    const commonHTML = `
        <label>Position [mm]:</label>
        <input type="range" id="${id}-pos-slider" step="0.1" min="0" max="50" value="5" oninput="updateValue(this.value, ${id}, 'pos')">
        <input type="number" id="${id}-pos-number" step="0.1" min="0" max="50" value="5" oninput="updateValue(this.value, ${id}, 'pos')">
        <br>
        <input type="button" value="Delete" onclick="deleteElement(${id})">
    `
    switch (type) {
        case 'flatRefraction':
            element = new FlatRefractionElement(1, 1, 50);
            domElement.innerHTML = `
                Flat refraction<br><br>
                <label>Refraction index:</label>
                <input type="range" id="${id}-fraction-slider" step="0.01" min="0" max="2" value="1" oninput="updateValue(this.value, ${id}, 'fraction')">
                <input type="number" id="${id}-fraction-number" step="0.01" value="1" oninput="updateValue(this.value, ${id}, 'fraction')">
                <br>
                ${commonHTML}
            `;
            break;
        case 'curvedRefraction':
            element = new CurvedRefractionElement(1, 1, 1, 50);
            domElement.innerHTML = `
                Curved refraction<br><br>
                <label>Refraction index:</label>
                <input type="range" id="${id}-fraction-slider" step="0.01" min="0" max="2" value="1" oninput="updateValue(this.value, ${id}, 'fraction')">
                <input type="number" id="${id}-fraction-number" step="0.01" min="0" max="2" value="1" oninput="updateValue(this.value, ${id}, 'fraction')">
                <br>
                <label>Radius of curvature [mm]:</label>
                <input type="range" id="${id}-curve-slider" step="0.1" min="-100" max="100" value="1" oninput="updateValue(this.value, ${id}, 'curve')">
                <input type="number" id="${id}-curve-number" step="0.1" value="1" oninput="updateValue(this.value, ${id}, 'curve')">
                <br>
                ${commonHTML}
            `;
            break;
        case 'thinLens':
            element = new ThinLensElement(50, 50);
            domElement.innerHTML = `
                Thin lens<br><br>
                <label>Focal Length [mm]:</label>
                <input type="range" id="${id}-focal-slider" step="0.1" min="-100" max="100" value="5" oninput="updateValue(this.value, ${id}, 'focal')">
                <input type="number" id="${id}-focal-number" step="0.1" value="5" oninput="updateValue(this.value, ${id}, 'focal')">
                <br>
                ${commonHTML}
            `;
            break;
        case 'thickLens':
            element = new ThickLensElement(1, 1, 1, 1, 10, 50);
            domElement.innerHTML = `
                Thick lens<br><br>
                <label>Refraction index:</label>
                <input type="range" id="${id}-fraction-slider" step="0.01" min="0" max="2" value="1" oninput="updateValue(this.value, ${id}, 'fraction')">
                <input type="number" id="${id}-fraction-number" step="0.01" value="1" oninput="updateValue(this.value, ${id}, 'fraction')">
                <br>
                <label>Input radius of curvature [mm]:</label>
                <input type="range" id="${id}-curve1-slider" step="0.01" min="-50" max="50" value="0.1" oninput="updateValue(this.value, ${id}, 'curve1')">
                <input type="number" id="${id}-curve1-number" step="0.01" value="0.1" oninput="updateValue(this.value, ${id}, 'curve1')">
                <br>
                <label>Output radius of curvature [mm]:</label>
                <input type="range" id="${id}-curve2-slider" step="0.01" min="-50" max="50" value="0.1" oninput="updateValue(this.value, ${id}, 'curve2')">
                <input type="number" id="${id}-curve2-number" step="0.1" value="1" oninput="updateValue(this.value, ${id}, 'curve2')">
                <br>
                <label>Thickness [mm]:</label>
                <input type="range" id="${id}-thick-slider" step="0.1" min="0" max="25" value="1" oninput="updateValue(this.value, ${id}, 'thick')">
                <input type="number" id="${id}-thick-number" value="1" oninput="updateValue(this.value, ${id}, 'thick')">
                <br>
                ${commonHTML}
            `;
            break;
        }
    document.getElementById('elements-div').appendChild(domElement);
    domElements[id] = domElement;
    userElements[id] = element;
    id++;
    render();
}

function deleteElement(id) {
    domElements[id].remove();
    delete domElements[id];
    delete userElements[id];
    render();
}

function populateSpace(userElementDict) {
    let userElements = [];
    for (let prop in userElementDict) {
        userElements.push(userElementDict[prop]);
    }
    userElements.sort((a, b) => a.pos - b.pos);
    if (userElements.length === 0)
        return [new FreeSpaceElement(500, 0)];

    let elements = [];
    elements.push(new FreeSpaceElement(userElements[0].pos, 0));
    let lastN = 1;
    for (let i = 0; i < userElements.length; i++) {
        if (userElements[i].constructor.name === 'ThickLensElement') {
            elements.push(new CurvedRefractionElement(lastN, userElements[i].n2, userElements[i].r1, userElements[i].pos));
            elements.push(new FreeSpaceElement(userElements[i].t, userElements[i].pos));
            elements[elements.length - 1].n = userElements[i].n2;
            elements.push(new CurvedRefractionElement(userElements[i].n2, lastN, userElements[i].r2, userElements[i].pos + userElements[i].t));
        } else {
            if (userElements[i].constructor.name.includes('RefractionElement')) {
                userElements[i].n1 = elements[elements.length - 1].n;
                lastN = userElements[i].n2;
            }
            elements.push(userElements[i]);
        }
        
        if (i < userElements.length - 1) {
            let newSpace = new FreeSpaceElement(userElements[i + 1].pos - elements[elements.length - 1].pos, elements[elements.length - 1].pos);
            newSpace.n = lastN;
            elements.push(newSpace);
        }
    }
    let newSpace = new FreeSpaceElement(500 - elements[elements.length - 1].pos, elements[elements.length - 1].pos);
    newSpace.n = lastN;
    elements.push(newSpace);
    return elements;
}

function updateValue(value, id, field) {
    value = parseFloat(value);
    document.getElementById(id + "-" + field + "-slider").value = value;
    document.getElementById(id + "-" + field + "-number").value = value;
    switch (field) {
        case 'focal':
            userElements[id].f = value * 10;
            break;
        case 'pos':
            userElements[id].pos = value * 10;
            break;
        case 'fraction':
            userElements[id].n2 = value;
            break;
        case 'curve':
            userElements[id].r = value * 10;
            break;
        case 'curve1':
            userElements[id].r1 = value * 10;
            break;
        case 'curve2':
            userElements[id].r2 = value * 10;
            break;
        case 'thick':
            userElements[id].t = value * 10;
            break;
    }
    render();
}

function updateRay(value, id, field) {
    value = parseFloat(value);
    document.getElementById(id + "-" + field + "-slider").value = value;
    document.getElementById(id + "-" + field + "-number").value = value;
    switch (field) {
        case 'pos':
            rays[id][0] = value * 10;
            break;
        case 'angle':
            rays[id][1] = value;
            break;
    }
    render();
}

function addRay(pos, angle) {
    let ray = [pos, angle];
    let rayElement = document.createElement('div');
    rayElement.classList.add('element-container');
    rayElement.innerHTML = `
        <label>Ray position [mm]:</label><br>
        <input type="range" id="${id}-pos-slider" step="0.1" min="-12.5" max="12.5" value="${pos}" oninput="updateRay(this.value, ${id}, 'pos')">
        <input type="number" id="${id}-pos-number" step="0.1" min="-125" max="125" value="${pos}" oninput="updateRay(this.value, ${id}, 'pos')">
        <br>
        <label>Ray angle [rad]:</label>
        <input type="range" id="${id}-angle-slider" step="0.01" min="-2" max="2" value="${angle}" oninput="updateRay(this.value, ${id}, 'angle')">
        <input type="number" id="${id}-angle-number" step="0.01" value="${angle}" oninput="updateRay(this.value, ${id}, 'angle')">
        <br>
        <button onclick="removeRay(${id})">Remove</button>
    `;
    document.getElementById('rays-div').appendChild(rayElement);
    rayElements[id] = rayElement;
    rays[id] = ray;
    id++;
    render();
}

function removeRay(id) {
    rayElements[id].remove();
    delete rayElements[id];
    delete rays[id];
    render();
}

function loadPreset(preset) {
    function reset() {
        for (let prop in userElements) {
            domElements[prop].remove();
            delete userElements[prop];
            delete domElements[prop];
        }
        for (let prop in rays) {
            rayElements[prop].remove();
            delete rays[prop];
            delete rayElements[prop];
        }
        id = 0;
    }

    function addRays() {
        addRay(0, 0.5);
        addRay(0, 0.25);
        addRay(0, 0);
        addRay(0, -0.25);
        addRay(0, -0.5);
    }

    switch (preset) {
        case 'empty':
            reset();
            break;
        case 'achromat':
            reset();
            createOpticalElement('flatRefraction');
            updateValue(1.5, 0, 'fraction');
            updateValue(15.0, 0, 'pos');
            createOpticalElement('curvedRefraction');
            updateValue(1.65, 1, 'fraction');
            updateValue(25.0, 1, 'pos');
            updateValue(5.0, 1, 'curve');
            createOpticalElement('curvedRefraction');
            updateValue(1, 2, 'fraction');
            updateValue(35.0, 2, 'pos');
            updateValue(-5.0, 2, 'curve');
            addRays();
            break;
        case 'protar':
            reset();
            createOpticalElement('curvedRefraction');
            updateValue(1.5, 0, 'fraction');
            updateValue(15.0, 0, 'pos');
            updateValue(10.0, 0, 'curve');
            createOpticalElement('curvedRefraction');
            updateValue(1.63, 1, 'fraction');
            updateValue(20.0, 1, 'pos');
            updateValue(5.0, 1, 'curve');
            createOpticalElement('curvedRefraction');
            updateValue(1, 2, 'fraction');
            updateValue(23.0, 2, 'pos');
            updateValue(8.0, 2, 'curve');
            createOpticalElement('curvedRefraction');
            updateValue(1.5, 3, 'fraction');
            updateValue(30.0, 3, 'pos');
            updateValue(-8.0, 3, 'curve');
            createOpticalElement('curvedRefraction');
            updateValue(1.7, 4, 'fraction');
            updateValue(35.0, 4, 'pos');
            updateValue(8.0, 4, 'curve');
            createOpticalElement('curvedRefraction');
            updateValue(1, 5, 'fraction');
            updateValue(39.0, 5, 'pos');
            updateValue(-8.0, 5, 'curve');
            addRays();
            break;
    }
    render();
}
