class Sensor {
    constructor(iconName, position) {
        this.iconName = iconName;
        this.position = position;
        this.offsetY = 0; // Initialiser l'offset vertical
        this.floatSpeed = 0.02; // Vitesse de flottement
        this.floatAmplitude = 5; // Amplitude du flottement
        this.iconPromise = this.#loadImage(); // Charger l'image une seule fois
        this.selected = false; // Ajout de la propriété selected
        this.scale = 1; // Échelle initiale
        this.scaleSpeed = 0.05; // Vitesse de changement d'échelle
        this.maxScale = 1.2; // Échelle maximale
    }

    async #loadImage() {
        return new Promise((resolve, reject) => {
            const icon = new Image();
            icon.crossOrigin = "anonymous";
            icon.src = "resources/" + this.iconName;
            icon.onload = () => {
                resolve(icon);
            };
            icon.onerror = () => {
                console.error("Erreur de chargement de l'image : " + this.iconName);
                reject();
            };
        });
    }

    containsPoint(x, y) {
        const dx = this.position.x;
        const dy = this.position.y + this.offsetY;
        return x >= dx && x <= dx + 150 && y >= dy && y <= dy + 150;
    }

    async draw(ctx) {
        try {
            const icon = await this.iconPromise;

            // Calcul de l'échelle
            if (this.selected && this.scale < this.maxScale) {
                this.scale += this.scaleSpeed;
            } else if (!this.selected && this.scale > 1) {
                this.scale -= this.scaleSpeed;
            }
            this.scale = Math.max(1, Math.min(this.maxScale, this.scale));

            // Sauvegarder l'état du contexte
            ctx.save();

            // Déplacer le point d'origine au centre de l'icône
            ctx.translate(this.position.x + 75, this.position.y + this.offsetY + 75);

            // Mettre à l'échelle
            ctx.scale(this.scale, this.scale);

            // Dessiner l'icône
            ctx.drawImage(
                icon,
                -75, // Déplacer l'icône pour compenser le changement d'origine
                -75,
                150,
                150
            );

            // Restaurer l'état du contexte
            ctx.restore();

            if (this.selected) {
                // Afficher le nom de l'icône seulement si sélectionné
                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
            }

            this.offsetY = Math.sin(Date.now() * this.floatSpeed) * this.floatAmplitude;
        } catch (error) {
            console.error("Erreur lors du dessin de l'icône : " + this.iconName, error);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "red";
            ctx.fillRect(
                this.position.x,
                this.position.y + this.offsetY,
                150,
                150
            );
            ctx.fillStyle = "white";
            ctx.font = "16px Arial";
            ctx.fillText("Erreur", this.position.x + 20, this.position.y + this.offsetY + 55);
        }
    }
}