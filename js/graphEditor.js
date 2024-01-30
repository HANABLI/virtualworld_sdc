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

    #addEventListeners() {
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());
        this.canvas.addEventListener("mouseup", () => this.dragging = false);
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

   
}