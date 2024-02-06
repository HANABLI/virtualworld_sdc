class ViewPort {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.zoom = 0.1; 
        this.center = new Point(canvas.width / 2, canvas.height / 2);
        this.offset = scale(this.center, -1);
        this.pan = {
            start: new Point(0, 0),
            end: new Point(0, 0),
            offset: new Point(0, 0),
            active: false
        };       
        this.#addEventListeners();
    }


    #addEventListeners() {
        this.canvas.addEventListener("mousewheel", this.#handleMouseWheel.bind(this));
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
    }

    #handleMouseDown(evt) {
        if (evt.button == 1) {
            this.pan.start = this.getMouse(evt);
            this.pan.active = true;
        }
    }

    #handleMouseUp(evt) {
        if (this.pan.active) {
            this.offset = add(this.offset, this.pan.offset);
            this.pan = {
                start: new Point(0, 0),
                end: new Point(0, 0),
                offset: new Point(0, 0),
                active: false
            };
        }
    }

    #handleMouseMove(evt) {
        if (this.pan.active) {
            this.pan.end = this.getMouse(evt);
            this.pan.offset = substract(this.pan.end, this.pan.start);
        }
    }

    #handleMouseWheel(evt) {
        const direction = Math.sign(evt.deltaY);
        const step = 0.1
        this.zoom += direction * step;
        this.zoom = Math.max(0.1, Math.min(10, this.zoom));
    }

    getMouse(evt, substractPanOffset = false) {
        const p =  new Point(
            (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this.zoom - this.offset.y
        );
        return substractPanOffset ? substract(p, this.pan.offset) : p;
    }

    getOffset() {
        return add(this.offset, this.pan.offset);
    }

    reset() {
        this.ctx.restore();
        this.ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);
        const offset = this.getOffset();
        this.ctx.translate(offset.x, offset.y);
    }
}