class GraphEditor {
    constructor(viewPort, graph) {
        this.viewPort = viewPort;
        this.canvas = this.viewPort.canvas;
        this.graph = graph;
        this.ctx = this.canvas.getContext("2d");
        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mousePoint = null;
        this.#addEventListeners();
    }

    #removePoint(point) {
        this.graph.removePoint(point);
            if (this.selected == point) {
                this.selected = null;
            }
            this.hovered = null;  
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
        this.boundMouseUp = () => this.dragging = false;
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
        this.canvas.addEventListener("mouseup", this.boundMouseUp);
    }

    #removeEventListeners() {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("mouseup", this.boundMouseUp);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    #handleMouseMove(evt) {
        this.mousePoint = this.viewPort.getMouse(evt, true);
        this.hovered = getNearestPoint(this.mousePoint, this.graph.points, 10);
        if (this.dragging == true) {
            this.selected.x = this.mousePoint.x;
            this.selected.y = this.mousePoint.y;
        }
    }

    #handleMouseDown(evt) {
        if (evt.button == 0) {     // left click           
            //const mousePoint = new Point(evt.offsetX, evt.offsetY);
            //this.hovered = getNearestPoint(mousePoint, this.graph.points, 10); - not needed (present in mousemove event)
            if (this.hovered) {
                this.#select(this.hovered);                   
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mousePoint);
            this.#select(this.mousePoint);
            this.hovered = this.mousePoint;
            console.log("added point:", this.mousePoint);  
            }
        if (evt.button == 2) { // right click

            if (this.selected) {
                this.selected = null;
            } else if (this.hovered) {
                this.#removePoint(this.hovered);
            }        
        }
    }

    #select(point) {
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    display() {
        this.graph.draw(this.ctx);
        if (this.hovered) {
            this.hovered.draw(this.ctx, { fill: true});
        }
        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mousePoint;
            new Segment(this.selected, intent).draw(ctx, { dash: [3, 3] });
            this.selected.draw(this.ctx, {outline: true});
        }
    }

    dispose() {
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }
   
}