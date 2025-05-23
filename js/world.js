class World {
    constructor(graph, viewport,
        roadWidh = 100, 
        roadRoundness = 10, 
        buildingWidth = 150, 
        buildingMinLength = 150, 
        spacing = 50,
        treeSize = 160 ) {
        this.graph = graph;
        this.roadWidth = roadWidh;
        this.roadRoundness = roadRoundness;
        this.buildingWidth = buildingWidth;
        this.buildingMinLength = buildingMinLength;
        this.spacing = spacing;
        this.treeSize = treeSize;
        this.viewport = viewport;
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };
        this.infoPanelWidth = 200;
        this.infoPanelHeight = 150;
        this.infoPanelX = 10;
        this.infoPanelY = 10;
        this.buildings = [];
        this.roadBorders = [];
        this.envelopes = [];
        this.lineGuides = [];
        this.markings = [];
        this.sensors = [];
        // In your World class:
        this.videoElements = {}; // Store video elements
        this.videos = {
            "Camera.png": "camera", // Changed to "camera"
            "Wall.png": "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
        }

        this.generate();
        this.initCameraStream(); // Initialize camera stream
    }

    async initCameraStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.loop = true;
            video.style.display = 'none';
            document.body.appendChild(video);
            this.videoElements["camera"] = video; // Store as "camera"
            video.play();
            console.log("Camera stream initialized successfully.");
        } catch (err) {
            console.error("Error accessing camera:", err);
        }
    }

    generate() {
        this.envelopes.length = 0;
        for (const seg of this.graph.segments) {
            this.envelopes.push(new Envelope(seg, this.roadWidth, this.roadRoundness));
        }
        this.roadBorders = Polygon.union(this.envelopes.map((env) => env.polygone));
        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();
        this.lineGuides.length = 0;
        this.lineGuides.push(...this.#generateLineGuides());
    }


    getNearestSensor(loc) {
        let minDist = Number.MAX_SAFE_INTEGER;
        let nearest = null;

        for (const sensor of this.sensors) {
            const dist = distance(sensor.position, loc);
            if (dist < minDist) {
                minDist = dist;
                nearest = sensor;
            }
        }
        return nearest;
    }

    addSensor(sensor) {
        this.sensors.push(sensor);
    }

    removeSensor(sensor) {
        this.sensors.splice(this.sensors.indexOf(sensor), 1);
    }

    #generateTrees() {
        const points = [
            ...this.roadBorders.map(s => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.base.points).flat()
        ];

        const left = Math.min(...points.map((p) => p.x));
        const right = Math.max(...points.map((p) => p.x));
        const top = Math.min(...points.map((p) => p.y));
        const bottom = Math.max(...points.map((p) => p.y));

        const illegalPolys = [
            ...this.buildings.map((b) => b.base),
            ...this.envelopes.map((e) => e.polygone)
        ];

        let tryCount = 0;
        const trees = [];
        while (tryCount < 100) {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            );

            // check if tree inside or nearby building / road
            let keep = trees;
            for (const poly of illegalPolys) {
                if (poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize / 2) {
                    keep = false;
                    break;
                }
            }

            // check if trees intersects each others
            if (keep) {
                for (const tree of trees) {
                    if (distance(tree.center, p) < this.treeSize) {
                        keep = false;
                        break;
                    }
                }
            }

            // avoiding trees in the middle of nowhere
            if (keep) {
                let closeToSomething = false;
                for (const poly of illegalPolys) {
                    if (poly.distanceToPoint(p) < this.treeSize * 2) {
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething;
            }

            if (keep) {
                trees.push(new Tree(p, this.treeSize));
                tryCount = 0;
            }
            tryCount++;
        }
        return trees;
    }

    #generateBuildings() {
        const tmpEnvelopes = [];
        for (const seg of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    seg, 
                    this.roadWidth + this.buildingWidth + this.spacing * 2,
                    this.roadRoundness
                )
            )
        }

        const guides = Polygon.union(tmpEnvelopes.map((e) => e.polygone));
        
        for (let i = 0; i < guides.length; i++) {
            const seg =  guides[i];
            if (seg.length() < this.buildingMinLength) {
                guides.splice(i, 1);
                i--;
            }
        }
        
        const supports = [];
        for (let seg of guides) {
            const len = seg.length() + this.spacing;
            const buildingCount = Math.floor (
                len / (this.buildingMinLength + this.spacing)
            );
            const buildingLength = len / buildingCount - this.spacing;

            const dir = seg.directionVector();

            let q1 = seg.p1;
            let q2 = add(q1, scale(dir, buildingLength));
            supports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases = [];
        for (const seg of supports) {
            bases.push(new Envelope(seg, this.buildingWidth).polygone);
        }

        for (let i = 0; i < bases.length - 1; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if (
                    bases[i].intersectsPoly(bases[j]) || 
                    bases[i].distanceToPoly(bases[j]) < this.spacing
                ) {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases.map((b) => new Building(b));
    }

    #generateLineGuides() {
        const tmpEnvelopes = [];
        for (const seg of this.graph.segments) {
            tmpEnvelopes.push(
                new Envelope(
                    seg, 
                    this.roadWidth / 2,
                    this.roadRoundness
                )
            );
        }
        const segments = Polygon.union(tmpEnvelopes.map((e) => e.polygone));
        return segments;
    }



    draw(ctx, viewPoint) {

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Sauvegarder l'état initial du canvas
        ctx.save();


        let selectedSensor = null
        for (const envelope of this.envelopes) {
            envelope.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15});
        }
        for (const seg of this.roadBorders) {
            seg.draw(ctx, { color: "white", width: 4 });
        }
        for (const seg of this.graph.segments) {
            seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
        }
        for (const marking of this.markings) {
            marking.draw(ctx);
        }

        const items = [...this.buildings, ...this.trees];
        items.sort(
            (a, b) =>
            b.base.distanceToPoint(viewPoint) -
            a.base.distanceToPoint(viewPoint)
        );
        for (const item of items) {
            item.draw(ctx, viewPoint);
        }
        for (const sensor of this.sensors) {
            sensor.draw(ctx);
            if (sensor.selected) {
                selectedSensor = sensor;
            }
        }
        // Restaurer l'état du canvas pour annuler les transformations du viewport
        ctx.restore();

        // Sauvegarder l'état actuel du canvas avant de dessiner l'infoPanel
        ctx.save();

        // Dessiner l'infoPanel
        this.#drawInfoPanel(ctx, selectedSensor);

        // Dessiner le videoPanel
        this.#drawVideoPanel(ctx, selectedSensor);

        // Restaurer l'état du canvas pour annuler les transformations de l'infoPanel
        ctx.restore();
    }

    async #drawInfoPanel(ctx, sensor) {

        // Restaurer les transformations du viewport pour dessiner le panneau d'informations dans le coin supérieur gauche
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.infoPanelX, this.infoPanelY, this.infoPanelWidth, this.infoPanelHeight);

        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';

        if (sensor && sensor.selected) {
            ctx.fillText(`Icon: ${sensor.iconName}`, this.infoPanelX + 10, this.infoPanelY + 20);
            ctx.fillText(`X: ${sensor.position.x.toFixed(2)}`, this.infoPanelX + 10, this.infoPanelY + 40);
            ctx.fillText(`Y: ${sensor.position.y.toFixed(2)}`, this.infoPanelX + 10, this.infoPanelY + 60);  

        } else {
            ctx.fillText('No sensor selected', this.infoPanelX + 10, this.infoPanelY + 20);
        }
    }

    async #drawVideoPanel(ctx, sensor) {
        // Restaurer les transformations du viewport
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Définir la position et la taille du panneau vidéo
        const videoPanelX = this.infoPanelX;
        const videoPanelY = this.infoPanelY + this.infoPanelHeight + 10; // Positionné sous le panneau d'informations
        const videoPanelWidth = this.infoPanelWidth;
        const videoPanelHeight = 150; // Hauteur du panneau vidéo

        // Dessiner le fond du panneau vidéo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(videoPanelX, videoPanelY, videoPanelWidth, videoPanelHeight);

        // Si un capteur est sélectionné, afficher la vidéo (simulée ici avec un texte)
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        if (sensor && sensor.selected) {
            // Check if the sensor is a video sensor
            if (sensor.iconName === "Camera.png") { // Check for "Camera.png"
                const video = this.videoElements["camera"]; // Access camera stream
                if (video) {
                    try {
                        ctx.drawImage(video, videoPanelX, videoPanelY, videoPanelWidth, videoPanelHeight);
                    } catch (e) {
                        console.error("Error drawing camera stream:", e);
                        ctx.fillText("Error: Camera stream failed.", videoPanelX + videoPanelWidth / 2, videoPanelY + videoPanelHeight / 2);
                    }
                } else {
                    ctx.fillText("Camera stream not initialized.", videoPanelX + videoPanelWidth / 2, videoPanelY + videoPanelHeight / 2);
                }
            }
            else if (this.videos[sensor.iconName]) {
                const videoUrl = this.videos[sensor.iconName];
                // Create a video element
                let video = this.videoElements[videoUrl];
                if (!video) {
                    video = document.createElement('video');
                    video.src = videoUrl;
                    video.muted = true;
                    video.loop = true;
                    video.style.display = 'none';
                    document.body.appendChild(video);
                    this.videoElements[videoUrl] = video;
                    video.load();
                }
                if (video) {
                    try {
                        ctx.drawImage(video, videoPanelX, videoPanelY, videoPanelWidth, videoPanelHeight);
                    } catch (e) {
                        console.error("Error drawing video:", e);
                        ctx.fillText("Error: Video failed.", videoPanelX + videoPanelWidth / 2, videoPanelY + videoPanelHeight / 2);
                    }
                } else {
                    ctx.fillText("Video Element Not Found", videoPanelX + videoPanelWidth / 2, videoPanelY + videoPanelHeight / 2);
                }
            }
            else {
                ctx.fillText('Video Stream Here', videoPanelX + videoPanelWidth / 2, videoPanelY + videoPanelHeight / 2);
            }
        } else {
            ctx.fillText('No Video', videoPanelX + videoPanelWidth / 2, videoPanelY + videoPanelHeight / 2);
        }
    }

}
