import "./index.scss";

import { PathDrag } from "./js/drag";
import { rangeValue } from "./js/number";

const to = (pathDrag, path) => {
  const len = path.getTotalLength();
  const d = len * pathDrag.progress;
  path.setAttribute("stroke-dasharray", len + " " + len);
  path.setAttribute("stroke-dashoffset", len - d);
};

{
  const pathBrightness = document.getElementById("pathBrightness");
  const pathContrast = document.getElementById("pathContrast");
  const btnBrightness = document.getElementById("btnBrightness");
  const btnContrast = document.getElementById("btnContrast");

  const pathBrightnessValue = document.getElementById("pathBrightnessValue");
  const pathContrastValue = document.getElementById("pathContrastValue");

  const pathDragBrightness = new PathDrag(btnBrightness, pathBrightness);
  const pathDragContrast = new PathDrag(btnContrast, pathContrast);
  pathDragBrightness.addResizUpdate();
  pathDragContrast.addResizUpdate();
  const photo = document.getElementById("photo");
  const photoFilter = (data) => {
    photo.style.filter = `brightness(${rangeValue(
      pathDragBrightness.progress * pathDragBrightness.progress,
      0.5,
      2.5
    )}) contrast(${rangeValue(pathDragContrast.progress * pathDragContrast.progress, 0.5, 2.5)})`;
  };
  pathDragBrightness.on("progress", (data) => {
    to(data, pathBrightnessValue);
    photoFilter();
  });
  pathDragContrast.on("progress", (data) => {
    to(data, pathContrastValue);
    photoFilter();
  });
  pathDragBrightness.setProgress(0.5);
  pathDragContrast.setProgress(0.5);
}
{
  const pathR = document.getElementById("pathR");
  const pathG = document.getElementById("pathG");
  const pathB = document.getElementById("pathB");

  const pathRValue = document.getElementById("pathRValue");
  const pathGValue = document.getElementById("pathGValue");
  const pathBValue = document.getElementById("pathBValue");

  pathRValue.setAttribute("d", pathR.getAttribute("d"));
  pathGValue.setAttribute("d", pathG.getAttribute("d"));
  pathBValue.setAttribute("d", pathB.getAttribute("d"));

  const btnR = document.getElementById("btnR");
  const btnG = document.getElementById("btnG");
  const btnB = document.getElementById("btnB");

  const changeColor = () => {
    const box = document.getElementById("box");
    const color = [
      Math.round(pathDragR.progress * 255),
      Math.round(pathDragG.progress * 255),
      Math.round(pathDragB.progress * 255),
    ];
    box.style.backgroundColor = "rgb(" + color + ")";
    box.textContent = color;

    box.style.boxShadow = "0px 0px 10px rgba(" + color + ", 0.75)";
  };

  const pathDragR = new PathDrag(btnR, pathR);
  const pathDragG = new PathDrag(btnG, pathG);
  const pathDragB = new PathDrag(btnB, pathB);
  pathDragR.addResizUpdate();
  pathDragG.addResizUpdate();
  pathDragB.addResizUpdate();

  pathDragR.on("progress", (data) => {
    data.element.textContent = Math.round(data.progress * 255);
    to(data, pathRValue);
    changeColor();
  });
  pathDragG.on("progress", (data) => {
    data.element.textContent = Math.round(data.progress * 255);
    to(data, pathGValue);
    changeColor();
  });
  pathDragB.on("progress", (data) => {
    data.element.textContent = Math.round(data.progress * 255);
    to(data, pathBValue);
    changeColor();
  });

  pathDragR.setProgress(Math.random());
  pathDragG.setProgress(Math.random());
  pathDragB.setProgress(Math.random());

  const pathRange = document.getElementById("pathRange");
  const pathRangeValue = document.getElementById("pathRangeValue");
  pathRangeValue.setAttribute("d", pathRange.getAttribute("d"));

  const btnStart = document.getElementById("btnStart");
  const btnEnd = document.getElementById("btnEnd");
  const update = (data) => {
    let a = pathDragStart;
    let b = pathDragEnd;
    if (a && b) {
      if (a.progress > b.progress) {
        [a, b] = [b, a];
      }
      const d = b.pathLength * b.progress - a.pathLength * a.progress;
      pathRangeValue.setAttribute("stroke-dasharray", 0 + " " + (b.pathLength - d + 1) + " " + d + " " + 0);
      pathRangeValue.setAttribute("stroke-dashoffset", -b.progress * b.pathLength);
      // pathRange.setAttribute("stroke-dasharray", 0 + " " + (d + 10) + " " + Math.max(a.length - d, 0) + " " + 10);
      // pathRange.setAttribute("stroke-dashoffset", -b.progress * b.length);
    }
  };
  const pathDragStart = new PathDrag(btnStart, pathRange);
  pathDragStart.addResizUpdate();
  pathDragStart.on("progress", update);
  pathDragStart.setProgress(0.25);
  const pathDragEnd = new PathDrag(btnEnd, pathRange);
  pathDragEnd.addResizUpdate();
  pathDragEnd.on("progress", update);
  pathDragEnd.setProgress(0.75);
}
