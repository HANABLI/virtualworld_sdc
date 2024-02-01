class World {
    constructor(graph, roadWidh = 100, roadRoundness = 10 ) {
        this.graph = graph;
        this.roadWidth = roadWidh;
        this.roadRoundness = roadRoundness;

        this.envelopes = [];

        this.generate();
    }
    
    generate() {
        this.envelopes.length = 0;
        for (const seg of this.graph.segments) {
            this.envelopes.push(new Envelope(seg, this.roadWidth, this.roadRoundness));
        }

        this.intersections = Polygon.break(
            this.envelopes[0].polygone,
            this.envelopes[1].polygone
        );
    }

    draw(ctx) {
        for (const envelope of this.envelopes) {
            envelope.draw(ctx);
        }
        for (const intersection of this.intersections) {
            intersection.draw(ctx, { color: "red", size: 6 });
        }
    }

}
