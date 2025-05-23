class SensorEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;
        this.sensors = world.sensors;
        this.sensor = null;
        this.canvas = this.viewport.canvas;
        this.ctx = this.canvas.getContext("2d");
        this.selectedIcon = null;
        this.mouse = null;
        this.dragging = false;
        this.draggedIcon = null;
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.bounddragStart = this.#handledragStart.bind(this);
        this.bounddragEnd = this.#handledragEnd.bind(this);
        this.boundDragOver = this.#handleDragOver.bind(this);
        this.boundDrop = this.#handleDrop.bind(this);
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
        this.selectedIcon = null;
        this.dragging = false;
        this.draggedIcon = null;
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("dragstart", this.bounddragStart);
        this.canvas.addEventListener("dragend", this.bounddragEnd);
        this.canvas.addEventListener("dragover", this.boundDragOver);
        this.canvas.addEventListener("drop", this.boundDrop);
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("dragstart", this.bounddragStart);
        this.canvas.removeEventListener("dragend", this.bounddragEnd);
        this.canvas.removeEventListener("dragover", this.boundDragOver);
        this.canvas.removeEventListener("drop", this.boundDrop);
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    }

    selectIcon(iconName) {
        this.selectedIcon = iconName;
        this.dragging = true;
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);
    }

    #handledragStart(evt) {
        console.log("dragStart");
        evt.dataTransfer.setData("text/plain", this.selectedIcon);
    }

    #handledragEnd(evt) {
        console.log("dragEnd");
    }

    #handleDragOver(evt) {
        evt.preventDefault();
    }

    #handleDrop(evt) {
        evt.preventDefault();
        const worldPoint = this.viewport.getMouse(evt, true);

        if (this.selectedIcon) {
            this.sensor = new Sensor(
                this.selectedIcon,
                worldPoint
            );
            this.sensors.push(this.sensor);
            console.log("added sensor:", worldPoint);

            this.dragging = false;
            this.draggedIcon = null;
            this.selectedIcon = null;
        }
    }

    #handleMouseDown(evt) {
        const mousePoint = this.viewport.getMouse(evt, true);

        // Déselectionner tous les sensors
        this.sensors.forEach(sensor => {
            sensor.selected = false;
        });

        // Sélectionner le sensor cliqué (s'il y en a un)
        this.sensors.forEach(sensor => {
            if (sensor.containsPoint(mousePoint.x, mousePoint.y)) {
                sensor.selected = true; // Sélectionner le sensor
                this.sensor = sensor;
            }
        });
    }

    display() {
        if (this.dragging && this.sensor) {
            this.sensor.draw(
                this.ctx
            );
        }
    }
}