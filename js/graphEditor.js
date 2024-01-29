class GraphEditor {
    constructor(canvas, graph) {
        this.canvas = canvas;
        this.graph = graph;
        this.ctx = this.canvas.getContext("2d");
        this.selected = null;
        this.hovered = null;
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousedown", (evt) => {
            if (evt.button == 0) {     // left click           
                const mousePoint = new Point(evt.offsetX, evt.offsetY);
                //this.hovered = getNearestPoint(mousePoint, this.graph.points, 10); - not needed (present in mousemove event)
                if (this.hovered) {
                    this.selected = this.hovered;
                    return;
                }
                this.graph.addPoint(mousePoint);
                this.selected = mousePoint;
                console.log("added point:", mousePoint);  
                }
            if (evt.button == 2) { // right click
                if (this.hovered) {
                    this.graph.removePoint(this.hovered);
                    if (this.selected == this.hovered) {
                        this.selected = null;
                    }
                    this.hovered = null;  
                }          
            }
        });
        this.canvas.addEventListener('mousemove', (evt) => {
            const mousePoint = new Point(evt.offsetX, evt.offsetY);
            this.hovered = getNearestPoint(mousePoint, this.graph.points, 10);
            if (this.dragging == true) {
                this.selected.x = mousePoint.x;
                this.selected.y = mousePoint.y;
            }
        });
        this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());
    }

    display() {
        this.graph.draw(this.ctx);
        if (this.hovered) {
            this.hovered.draw(this.ctx, { fill: true});
        }
        if (this.selected) {
            this.selected.draw(this.ctx, {outline: true});
        }
    }

   
}