class Graph {
    constructor(points = [], segments = []) {
        this.points = points;
        this.segments = segments;
    }

    static load(info) {
        const points = info.points.map((p) => new Point(p.x, p.y));
        const segments = [];
        // for (const point of info.points) {
        //     points.push(new Point(point.x, point.y));
        // }
        for (const seg of info.segments) {
            segments.push(new Segment(
                points.find((p) => p.equals(seg.p1)), 
                points.find((p) => p.equals(seg.p2))
            ));
        }
        return new Graph(points, segments);
    }

    draw(ctx) {
        for (const seg of this.segments) {
            seg.draw(ctx);
        }

        for (const point of this.points) {
            point.draw(ctx);
        }
    }

    dispose() {
        this.points.length = 0;
        this.segments.length = 0;
    }

    addPoint(point) {
        this.points.push(point);
    }

    addSegment(segment) {
        this.segments.push(segment);
    }

    removeSegments(segs) {
        segs.forEach(seg => {
            this.segments.splice(this.segments.indexOf(seg), 1);
        });     
    }

    removePoint(point) {
        const segments = this.getSegmentsWithPoint(point);
        this.removeSegments(segments);
        this.points.splice(this.points.indexOf(point), 1);
    }

    getSegmentsWithPoint(point) {
        return this.segments.filter(segment => segment.contains(point));
    }

    isContainsPoint(point) {
        return this.points.find(p => p.equals(point));
    }

    isContainsSegment(segment) {
        return this.segments.find(s => s.equals(segment));
    }

    tryAddPoint(point) {
        if (!this.isContainsPoint(point)) {
            this.addPoint(point);
            return true;
        }
        return false;
    }

    tryAddSegment(segment) {
        if (!this.isContainsSegment(segment) && !segment.p1.equals(segment.p2)) {
            this.addSegment(segment);
            return true;
        }
        return false;
    }
}