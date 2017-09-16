var width = 580;
var height = 760;

var div = d3.select("#dots");

var svg = div.append("svg")
             .attr("height", height)
             .attr("width", width);

var data = []

var r = 10;
var xspace = 35;
var yspace = 30;

for (var i = 0; i < 16; i++) {
  data.push([]);
  for (var j = 0; j < 25; j ++) {
    data[i].push({
      x: 10 + i*xspace,
      y: 10 + j*yspace,
      r: r
    });
  }
}

var rows = svg.selectAll(".row")
              .data(data)
              .enter()
              .append("g")
              .attr("class", "row");

var dots = rows.selectAll(".dot")
               .data(function(d) { return d; })
               .enter()
               .append("circle")
               .attr("class", "dot")
               .attr("cx", function(d) { return d.x; })
               .attr("cy", function(d) { return d.y; })
               .attr("r", r)
               .on('mouseover', dotMouseover)
               .on('mouseout', dotMouseout)
               .on('click', dotClick);

function dotMouseover(d) {
  d3.select(this).classed("dot-hover", true);
}

function dotMouseout(d) {
  d3.select(this).classed("dot-hover", false);
}

function dotClick(d) {
  var current = d3.select(this);
  current.classed("dot-selected", !current.classed("dot-selected"));
}