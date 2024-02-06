class StopEditor {
    constructor(viewport, world) {
        this.viewport = viewport;
        this.world = world;

        this.canvas = this.viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.mouse = null;
        this.intent = null;

        this.markings = world.markings;
    }

    enable() {
        this.#addEventListeners();
    }

    disable() {
        this.#removeEventListeners();
        this.selected = false;
        this.hovered = false;
    }

    #addEventListeners() {
        this.boundMouseDown = this.#handleMouseDown.bind(this);
        this.boundMouseMove = this.#handleMouseMove.bind(this);
        this.boundContextMenu = (evt) => evt.preventDefault();
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);
        const seg = getNearestSegment(
            this.mouse,
            this.world.lineGuides,
            50 * this.viewport.zoom
        );
        if (seg) {
            const projectPoint = seg.projectPoint(this.mouse);
            if (projectPoint.offset >= 0 && projectPoint.offset <=1) {
                this.intent = new Stop(
                    projectPoint.point,
                    seg.directionVector(),
                    world.roadWidth / 2,
                    world.roadWidth / 2
                );
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        }
    }

    #handleMouseDown(evt) {
        if (evt.button == 0) {
            if (this.intent) {
                this.markings.push(this.intent);
                this.intent = null;
            }
        }
        if (evt.button == 2) {
            for (let i = 0; i <= this.markings.length; i++) {
                const polygone = this.markings[0].polygone;
                if (polygone.containsPoint(this.mouse)) {
                    this.markings.splice(i, 1);
                    return;
                }
            }

        }
    }

    display() {
        if (this.intent) {
            this.intent.draw(this.ctx);
        }
    }
}
