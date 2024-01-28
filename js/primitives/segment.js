class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
 
    equals(segmet) {
        //return (this.p1 == segmet.p1 && this.p2 == segmet.p2) || (this.p2 == segmet.p1 && this.p1 == segmet.p2);
        return this.contains(segmet.p1) && this.contains(segmet.p2);
    }

    contains(point) {
        return this.p1.equals(point) || this.p2.equals(point);
    }
    
    draw(ctx, width = 2, color = "black") {
        ctx.beginPath();
        ctx.lineWidh = width;
        ctx.strokeStyle = color;
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
    }
}