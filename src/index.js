import "./index.scss";

import { PathDrag } from "./js/drag";
import { rangeValue } from "./js/number";

const path01 = document.getElementById("path01");
const path02 = document.getElementById("path02");
const path03 = document.getElementById("path03");

const path01_value = document.getElementById("path01_value");
const path02_value = document.getElementById("path02_value");
const path03_value = document.getElementById("path03_value");

path01_value.setAttribute("d", path01.getAttribute("d"));
path02_value.setAttribute("d", path02.getAttribute("d"));
path03_value.setAttribute("d", path03.getAttribute("d"));

const dragButton01 = document.getElementById("dragButton01");
const dragButton02 = document.getElementById("dragButton02");
const dragButton03 = document.getElementById("dragButton03");

const changeColor = () => {
  const box = document.getElementById("box");
  const color = [
    Math.round(pathDrag01.progress * 255),
    Math.round(pathDrag02.progress * 255),
    Math.round(pathDrag03.progress * 255),
  ];
  box.style.backgroundColor = "rgb(" + color + ")";
  box.textContent = color;

  box.style.boxShadow = "0px 0px 10px rgba(" + color + ", 0.75)";
};

const pathDrag01 = new PathDrag(dragButton01, path01);
const pathDrag02 = new PathDrag(dragButton02, path02);
const pathDrag03 = new PathDrag(dragButton03, path03);
pathDrag01.setResizUpdate();
pathDrag02.setResizUpdate();
pathDrag03.setResizUpdate();

const to = (pathDrag, path) => {
  const len = path.getTotalLength();
  const d = len * pathDrag.progress;
  path.setAttribute("stroke-dasharray", len + " " + len);
  path.setAttribute("stroke-dashoffset", len - d);
};

pathDrag01.on("progress", (data) => {
  data.element.textContent = Math.round(data.progress * 255);
  to(data, path01_value);
  changeColor();
});
pathDrag02.on("progress", (data) => {
  data.element.textContent = Math.round(data.progress * 255);
  to(data, path02_value);
  changeColor();
});
pathDrag03.on("progress", (data) => {
  data.element.textContent = Math.round(data.progress * 255);
  to(data, path03_value);
  changeColor();
});

pathDrag01.setProgress(Math.random());
pathDrag02.setProgress(Math.random());
pathDrag03.setProgress(Math.random());

const pathRange = document.getElementById("pathRange");
const pathRange_value = document.getElementById("pathRange_value");
pathRange_value.setAttribute("d", pathRange.getAttribute("d"));

const dragButtonStart = document.getElementById("dragButtonStart");
const dragButtonEnd = document.getElementById("dragButtonEnd");
const update = (data) => {
  let a = pathDragStart;
  let b = pathDragEnd;
  if (a && b) {
    if (a.progress > b.progress) {
      [a, b] = [b, a];
    }
    const d = b.pathLength * b.progress - a.pathLength * a.progress;
    pathRange_value.setAttribute("stroke-dasharray", 0 + " " + (b.pathLength - d + 1) + " " + d + " " + 0);
    pathRange_value.setAttribute("stroke-dashoffset", -b.progress * b.pathLength);
    // pathRange.setAttribute("stroke-dasharray", 0 + " " + (d + 10) + " " + Math.max(a.length - d, 0) + " " + 10);
    // pathRange.setAttribute("stroke-dashoffset", -b.progress * b.length);
  }
};
const pathDragStart = new PathDrag(dragButtonStart, pathRange);
pathDragStart.setResizUpdate();
pathDragStart.on("progress", update);
pathDragStart.setProgress(0.25);
const pathDragEnd = new PathDrag(dragButtonEnd, pathRange);
pathDragEnd.setResizUpdate();
pathDragEnd.on("progress", update);
pathDragEnd.setProgress(0.75);

const path04 = document.getElementById("path04");
const path05 = document.getElementById("path05");
const dragButton04 = document.getElementById("dragButton04");
const dragButton05 = document.getElementById("dragButton05");

const path04_value = document.getElementById("path04_value");
const path05_value = document.getElementById("path05_value");

const pathDrag04 = new PathDrag(dragButton04, path04);
const pathDrag05 = new PathDrag(dragButton05, path05);
pathDrag04.setResizUpdate();
pathDrag05.setResizUpdate();
const photo = document.getElementById("photo");
const photoFilter = (data) => {
  photo.style.filter = `brightness(${rangeValue(
    pathDrag04.progress * pathDrag04.progress,
    0.5,
    2.5
  )}) contrast(${rangeValue(pathDrag05.progress * pathDrag05.progress, 0.5, 2.5)})`;
};
pathDrag04.on("progress", (data) => {
  to(data, path04_value);
  photoFilter();
});
pathDrag05.on("progress", (data) => {
  to(data, path05_value);
  photoFilter();
});
pathDrag04.setProgress(0.5);
pathDrag05.setProgress(0.5);
