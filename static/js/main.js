var N_ROWS = 25
var N_COLS = 16

var width = 580;
var height = 760;

var div = d3.select("#dots");

var svg = div.append("svg")
             .attr("height", height)
             .attr("width", width);


var selected = [];
for (var i = 0 ; i < 16; i++) {
  selected.push([]);
}

var data = [];

var r = 10;
var xspace = 35;
var yspace = 30;

for (var i = 0; i < 16; i++) {
  data.push([]);
  for (var j = 0; j < 25; j ++) {
    data[i].push({
      iy: i,
      ix: j,
      x: 15 + i*xspace,
      y: 15 + j*yspace
    });
  }
}

var cols = svg.selectAll(".col")
              .data(data)
              .enter()
              .append("g")
              .attr("class", function(d, i) { return "y-" + i; })
              .classed("col", true);

var dots = cols.selectAll(".dot")
               .data(function(d) { return d; })
               .enter()
               .append("circle")
               .attr("class", function(d, i) { return "x-" + i; })
               .classed("dot", true)
               .attr("cx", function(d) { return d.x; })
               .attr("cy", function(d) { return d.y; })
               .attr("r", r)
               .on('mouseover', dotMouseover)
               .on('mouseout', dotMouseout)
               .on('click', dotClick);

svg.call(drawRect);

function dotMouseover(d) {
  d3.select(this).classed("dot-hover", true);
}

function dotMouseout(d) {
  d3.select(this).classed("dot-hover", false);
}

function dotClick(d, i) {
  var current = d3.select(this);
  current.classed("dot-selected", !current.classed("dot-selected"));

  //insert or delete if necessary
  var selectedIndex = selected[d.iy].indexOf(d.ix);
  if (selectedIndex === -1) {
    selected[d.iy].push(d.ix);
  } else {
    selected[d.iy].splice(selectedIndex, 1);
  }

}

function invert(point) {
  var x = point[0],
      y = point[1];
  var x_adj = Math.max(Math.round((x - 15) / xspace), 0);
  var y_adj = Math.max(Math.round((y - 15) / yspace), 0);
  return {x: x_adj, y: y_adj};
}

function drawRect(selection) {
  var keep = false;
  var rect, x, y, point, currx;

  selection.on('mousedown', function() {
                keep = true;
                point = d3.mouse(this);
                var indices = invert(point);
                x = indices.x;
                y = indices.y
                rect = svg.append("rect")
                          .attr("x", 15 + x * xspace)
                          .attr("y", 5 + y * yspace)
                          .style("fill", "#ececec");
            })
           .on('mouseup', function() {
                keep = false;
                if (currx) {
                  rect.attr("width", Math.abs(currx - x) * xspace);
                }
            })
           .on('mousemove', function() {
              if (keep) {
                var curr = d3.mouse(this);
                rect.attr("width", Math.abs(curr[0] - point[0]))
                    .attr("height", r*2);
                var inverted = invert(curr);
                currx = inverted.x
                if (currx >= x) {
                  var circle_class = ".y-" + currx + " .x-" + y;
                  d3.select(circle_class).classed("dot-selected", true);
                  if (selected[currx].indexOf(y) === -1) {
                    selected[currx].push(y);
                  }
                }
              }
            });
}

/////////////////////////////////////////////////
// MUSIC STUFF
/////////////////////////////////////////////////

var synth = new Tone.PolySynth().toMaster()

var NOTES = ['C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4',
             'D4', 'C#4', 'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3',
             'E3', 'D#3', 'D3', 'C#3', 'C3']

function encode(notes) {
  enc_notes = new Array(N_COLS);
  for (i = 0; i < N_COLS; i++) {
    value = 0;
    for (j = 0; j < notes[i].length; j++) {
      value += Math.pow(2, N_ROWS - 1 - notes[i][j]);
    }
    enc_notes[i] = value;
  }
  return enc_notes;
}

function decode(enc_notes) {
  var notes = [];
  for (i = 0; i < N_COLS; i++) {
    binary = enc_notes[i].toString(2);
    indices = [];
    for (j = 0; j < binary.length; j++) {
      if (binary[j] === '1') indices.push(N_ROWS - binary.length + j);
    }
    notes.push(indices);
  }
  return notes;
}

function playMeasure(notes) {
  for (var i = 0; i < notes.length; i++) {
    let a = [];
    for (var j = 0; j < notes[i].length; j++) {
      a.push(NOTES[notes[i][j]])
    }
    let temp = (i + 1).toString();
    synth.triggerAttackRelease(a, '8n', ' + (8n * ' + temp + ')');
  }
}

function playSong(enc_measures, notes) {
  for (i = 0; i < enc_measures.length; i++) {
    playMeasure(decode(enc_measures[i]));
  }
  playMeasure(notes);
}

function playMeasureHandler() {
  console.log(selected);
  playMeasure(selected);
}

function playSongHandler() {
  playSong(enc_measures, selected);
}
