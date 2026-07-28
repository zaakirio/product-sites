/* assay callout wires: thin assayer's-bench lines from a line on the paper receipt to the
   field the model extracted from it.

   Measured from the live DOM rather than hardcoded, so the lines stay correct at any width
   and after a font swap. Redrawn on resize and once webfonts land, since both move the
   anchors. Purely decorative: the page reads identically with this file absent, and the
   wires are not drawn at all once the layout stacks (they would cross the copy). */
(function () {
  "use strict";

  var band = document.querySelector(".extract");
  var svg = band && band.querySelector(".wires");
  if (!band || !svg) return;

  var NS = "http://www.w3.org/2000/svg";

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // stacked layout: CSS hides the svg, so skip the work entirely
    if (getComputedStyle(svg).display === "none") return;

    var origin = band.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + origin.width + " " + origin.height);

    var paper = band.querySelector(".paper");
    var paperRight = paper ? paper.getBoundingClientRect().right - origin.left : 0;

    var pairs = band.querySelectorAll("[data-src]");
    for (var i = 0; i < pairs.length; i++) {
      var from = pairs[i];
      var to = band.querySelector('[data-field="' + from.getAttribute("data-src") + '"]');
      if (!to) continue;

      var a = from.getBoundingClientRect();
      // land on the field's name, not the top border of its row
      var label = to.querySelector(".k b") || to;
      var b = label.getBoundingClientRect();

      // Start at the paper's right edge, not the anchor's own right edge. Most anchored
      // lines end well short of the edge, so starting at the text would run the wire back
      // across the receipt it came from.
      var x1 = paperRight + 4;
      var y1 = a.top - origin.top + a.height / 2;
      var x2 = b.left - origin.left - 8;
      var y2 = b.top - origin.top + b.height / 2;

      if (x2 <= x1) continue; // overlapping columns; a wire would read as a scribble

      var mid = x1 + (x2 - x1) * 0.55;
      var wrong = to.classList.contains("wrong");

      var p = document.createElementNS(NS, "path");
      // out horizontally, one right-angle step, then in horizontally: bench draughting,
      // not a swooping curve
      p.setAttribute("d", "M" + x1 + " " + y1 + " H" + mid + " V" + y2 + " H" + x2);
      if (wrong) p.setAttribute("class", "wrong");
      svg.appendChild(p);

      var dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", x1);
      dot.setAttribute("cy", y1);
      dot.setAttribute("r", 1.9);
      if (wrong) dot.setAttribute("class", "wrong");
      svg.appendChild(dot);
    }

    svg.classList.add("on");
  }

  var raf = 0;
  function schedule() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }

  schedule();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  window.addEventListener("resize", schedule, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(band);
})();
