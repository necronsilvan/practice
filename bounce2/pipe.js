
function pipe() {
    this.spacing = 170;
    this.top = random(height/6, 3/4*height);
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 25;
    this.speed = 4;
    this.highlight = false;

    this.hits = function(ovjBird) {
        if (ovjBird.y < this.top || ovjBird.y > height - this.bottom) {
            if (ovjBird.x > this.x && ovjBird.x < this.x + this.w) {
                this.highlight = true;
                return true;
            }
        }
        this.highlight = false;
        return false;
    }

    this.show = function() {
        fill(230,140,80);
        if (this.highlight) {
            fill(255, 0, 0);
        }

        rect(this.x, 0, this.w, this.top);
        rect(this.x, height-this.bottom, this.w, this.bottom);
    }

    this.update = function() {
        this.x -= this.speed;
    }

    this.offscreen = function() {
        if (this.x < -this.w) {
            return true;
        }
        else {
            return false;
        }
    }
}