// 7 frames: Group 4 (idle) → Group 10 (fully spread)
// Drawn on a shared <canvas> scaled to 28×28 display pixels.

const FRAME_PATHS = [
  '../assets/Group 4.png',
  '../assets/Group 5.png',
  '../assets/Group 6.png',
  '../assets/Group 7.png',
  '../assets/Group 8.png',
  '../assets/Group 9.png',
  '../assets/Group 10.png',
];

// Natural max dimensions across all frames — keeps every frame at the same scale
const MAX_W = 806;
const MAX_H = 682;

class BugAnimation {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.size    = canvas.width; // 32px internal resolution
    this.scale   = this.size / Math.max(MAX_W, MAX_H);
    this.frames  = [];
    this.timer   = null;
    this.idx     = 0;
    this._state  = 'idle';

    this._load();
  }

  _load() {
    let loaded = 0;
    FRAME_PATHS.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.frames[i] = img;
        loaded++;
        if (loaded === FRAME_PATHS.length) this._draw(0);
      };
    });
  }

  _draw(idx) {
    const img = this.frames[idx];
    if (!img) return;
    const w = img.naturalWidth  * this.scale;
    const h = img.naturalHeight * this.scale;
    const x = (this.size - w) / 2;
    const y = this.size - h;           // bottom-aligned
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.ctx.drawImage(img, x, y, w, h);
  }

  setState(state) {
    if (state === this._state) return;
    this._state = state;
    clearInterval(this.timer);
    this.timer = null;
    this.canvas.classList.remove('error-tint');

    if (state === 'idle') {
      this.idx = 0;
      this._draw(0);
    } else if (state === 'error') {
      this.idx = 6;
      this._draw(6);
      this.canvas.classList.add('error-tint');
    } else {
      const ms = state === 'responding' ? 60 : 120;
      this.timer = setInterval(() => {
        this.idx = (this.idx + 1) % this.frames.length;
        this._draw(this.idx);
      }, ms);
    }
  }

  destroy() {
    clearInterval(this.timer);
  }
}
