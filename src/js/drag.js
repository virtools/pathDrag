import { Vector, VectorE } from "./vector";
import { Point } from "./point";
import { Matrix2D } from "./matrix";
const setElementPos = (element, x, y) => {
  element.style.left = x + "px";
  element.style.top = y + "px";
};
const getElementPos = (element) => {
  return [element.offsetLeft, element.offsetTop];
};
const getElementPagePos = (element) => {
  const pos = [0, 0];
  let m = element;
  while (m) {
    pos[0] += m.scrollLeft ?? 0;
    pos[1] += m.scrollTop ?? 0;
    m = m.parentElement;
  }
  const rect = element.getBoundingClientRect();
  return [rect.x + pos[0], rect.y + pos[1]];
};
const getSVG = (element) => {
  let m = element;
  while (m) {
    if (m.tagName == "svg") {
      return m;
    }
    m = m.parentElement;
  }
  return;
};
const getSVGMatrix = (element) => {
  let m = element;
  let matrix2D = Matrix2D.identity();
  while (m) {
    if (m.tagName == "svg") {
      return matrix2D;
    }

    const data = m.transform.baseVal.consolidate();
    if (data && data.matrix) {
      const matrix = [
        data.matrix.a,
        data.matrix.b,
        0,
        data.matrix.c,
        data.matrix.d,
        0,
        data.matrix.e,
        data.matrix.f,
        1,
      ];
      matrix2D = Matrix2D.multiply(matrix, matrix2D);
    }

    m = m.parentElement;
  }
  return;
};
const posToArray = (pos) => {
  return [pos.x, pos.y];
};
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
import Listener from "./listener";

class Drag extends Listener {
  constructor(element) {
    super();
    this.element = element;
    this.mousedown = false;
    const start = (ev) => {
      if (!this.mousedown) {
        this.mousedown = true;
        this.fire("start", ev);
        ev.preventDefault();
      }
    };
    const move = (ev) => {
      //if (this.mousedown) {
      this.fire("move", ev);
      //}
      ev.preventDefault();
    };
    const end = (ev) => {
      //if (this.mousedown) {
      this.mousedown = false;
      this.fire("end", ev);
      //}
      ev.preventDefault();
    };

    if (isMobile()) {
      this.element.addEventListener("touchstart", start);
      this.element.addEventListener("touchmove", move);
      this.element.addEventListener("touchend", end);
    } else {
      const a_start = (ev) => {
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", a_end);
        start(ev);
      };
      const a_end = (ev) => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", a_end);
        end(ev);
      };
      this.element.addEventListener("mousedown", a_start);
    }
  }
}

class PathDrag extends Drag {
  constructor(element, path) {
    super(element);
    this.progress = -1;
    this.init();
    this.connect(path);
    this.setProgress(0);
  }
  setResizUpdate() {
    window.addEventListener("resize", () => {
      this.setProgress(this.progress, true);
    });
  }
  setProgress(value, enforce = false) {
    if (this.progress != value || enforce) {
      this.progress = Math.min(Math.max(value, 0), 1);
      if (this.path) {
        const pos = posToArray(this.path.getPointAtLength(this.pathLength * this.progress));
        const relativePos = VectorE.sub(getElementPagePos(this.svg), getElementPagePos(this.element.parentElement));

        const matrix = getSVGMatrix(this.path);
        if (matrix) {
          const newPos = Matrix2D.multiply(matrix, Matrix2D.translation(...pos));
          VectorE.set(pos, newPos[6], newPos[7]);
        }

        VectorE.add(pos, relativePos);
        setElementPos(this.element, ...pos);
        this.fire("progress", this);
      }
    }
  }
  init() {
    let local = [0, 0];
    let mousePos = [0, 0];
    this.on("start", (ev) => {
      const item = ev.touches ? ev.touches[0] : ev;
      this.element.classList.add("active");
      VectorE.set(mousePos, item.pageX, item.pageY);
      const dragButton01Position = getElementPos(this.element);
      local = Vector.sub(mousePos, dragButton01Position);
    });
    this.on("move", (ev) => {
      const item = ev.touches ? ev.touches[0] : ev;
      VectorE.set(mousePos, item.pageX, item.pageY);
      update();
    });
    this.on("end", (ev) => {
      this.element.classList.remove("active");
    });
    const update = () => {
      if (this.mousedown) {
        if (this.path) {
          //requestAnimationFrame(update);
          const dragButton01Position = getElementPos(this.element);
          const dragPos = Vector.sub(mousePos, local);
          const count = 5;
          let rr = Math.min(Point.distance(dragButton01Position, dragPos) * 0.5, 10);

          const relativePos = VectorE.sub(getElementPagePos(this.svg), getElementPagePos(this.element.parentElement));
          const matrix = getSVGMatrix(this.path);

          let length = this.pathLength * this.progress;
          let pos = posToArray(this.path.getPointAtLength(length));

          if (matrix) {
            const newPos = Matrix2D.multiply(matrix, Matrix2D.translation(...pos));
            VectorE.set(pos, newPos[6], newPos[7]);
          }
          VectorE.add(pos, relativePos);
          let distance = Point.distance(pos, dragPos);

          for (let i = 0; i <= count; i++) {
            for (let j = 0; j < 2; j++) {
              const tempLength = length + (j ? -1 : 1) * rr;
              pos = posToArray(this.path.getPointAtLength(tempLength));
              if (matrix) {
                const newPos = Matrix2D.multiply(matrix, Matrix2D.translation(...pos));
                VectorE.set(pos, newPos[6], newPos[7]);
              }
              VectorE.add(pos, relativePos);
              const tempDistance = Point.distance(pos, dragPos);
              if (tempDistance < distance) {
                distance = tempDistance;
                length = tempLength;
              }
            }
            rr *= 0.25;
          }
          this.setProgress(length / this.pathLength);
        } else {
          const dragPos = Vector.sub(mousePos, local);
          setElementPos(this.element, ...dragPos);
        }
      }
    };
    this.fire("init", this);
  }
  connect(path) {
    if (path) {
      this.path = path;
      this.svg = getSVG(this.path);
      this.pathLength = this.path.getTotalLength();
      this.setProgress(this.progress);
      this.fire("connect", this);
    }
  }
}
export { Drag, PathDrag };
