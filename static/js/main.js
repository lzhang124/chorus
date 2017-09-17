var N_ROWS = 25
var N_COLS = 16

var WIDTH = 580;
var HEIGHT = 780;

var NOTES = ['C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4',
             'D4', 'C#4', 'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3',
             'E3', 'D#3', 'D3', 'C#3', 'C3']

var synth = new Tone.PolySynth().toMaster()

/////////////////////////////////////////////////
// Load song
/////////////////////////////////////////////////

var songId = "";
var encMeasures = 0;

function getSong() {
  $.get({
    url: "/api/get_random",
    success: function(resp) {
      songId = resp.response
      encMeasures = resp.info
    }
  });
}

window.onload = function() {
  getSong();
}

/////////////////////////////////////////////////
// Front end
/////////////////////////////////////////////////

var div = d3.select("#dots");

var svg = div.append("svg")
             .attr("height", HEIGHT)
             .attr("width", WIDTH);

var selected = [];
for (var i = 0 ; i < 25; i++) {
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
      col: i,
      row: j,
      x: 15 + i*xspace,
      y: 20 + j*yspace
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
  var selectIndex = selected[d.row].indexOf([d.col, d.col + 1]);
  if (selectIndex === -1) {
    selected[d.row].push([d.col, d.col + 1]);
    synth.triggerAttackRelease(NOTES[i], '4n');
  } else {
    selected[d.row].splice(selectIndex, 1);
  }
}

function invert(point) {
  var x = point[0],
      y = point[1];
  var x_adj = Math.max(Math.round((x - 15) / xspace), 0);
  var y_adj = Math.max(Math.round((y - 20) / yspace), 0);
  if (y_adj > 15) {
    y_adj = 15;
  }
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
                          .attr("y", 10 + y * yspace)
                          .style("fill", "#ececec");
            })
           .on('mouseup', function() {
                keep = false;
                if (currx) {
                  rect.attr("width", Math.abs(currx - x) * xspace);
                  if (selected[y].indexOf([x, currx + 1]) === -1) {
                    selected[y].push([x, currx + 1]);
                  }
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
                }
              }
            });
}

function clearNotes() {
  // TODO
}

/////////////////////////////////////////////////
// MUSIC STUFF
/////////////////////////////////////////////////

zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))

function encode(notes) {
  encNotes = new Array(N_ROWS);
  for (i = 0; i < N_ROWS; i++) {
    startValue = 0;
    endValue = 0;
    for (j = 0; j < notes[i].length; j++) {
      startValue += Math.pow(2, N_COLS - 1 - notes[i][j][0]);
      endValue += Math.pow(2, N_COLS - 1 - notes[i][j][1]);
    }
    encNotes[i] = [startValue, endValue];
  }
  return encNotes;
}

function decode(encNotes) {
  var notes = [];
  for (i = 0; i < N_ROWS; i++) {
    startBinary = encNotes[i][0].toString(2);
    endBinary = encNotes[i][1].toString(2);
    startIndices = [];
    endIndices = [];
    for (j = 0; j < startBinary.length; j++) {
      if (startBinary[j] === '1') startIndices.push(N_COLS - startBinary.length + j);
    }
    for (j = 0; j < endBinary.length; j++) {
      if (endBinary[j] === '1') endIndices.push(N_COLS - endBinary.length + j);
    }
    notes.push(zip([startIndices, endIndices]));
  }
  return notes;
}

function playMeasure(notes) {
  Tone.Transport.clear();
  for (var i = 0; i < notes.length; i++) {
    for (var j = 0; j < notes[i].length; j++) {
      let start = notes[i][j][0];
      let end = notes[i][j][1];
      let duration = end - start;
      // debugger;
      Tone.Transport.schedule(function(time) {
        // debugger;
        synth.triggerAttackRelease(NOTES[i], '8n * ' + duration.toString(), time);
      }, '+8n * ' + start.toString());
    }
  }
  Tone.Transport.start('+0.01');
  /*
  for (var i = 0; i < notes.length; i++) {
    let a = [];
    for (var j = 0; j < notes[i].length; j++) {
      a.push(NOTES[notes[i][j]])
    }
    let temp = (i + 1).toString();
    synth.triggerAttackRelease(a, '8n', ' + (8n * ' + temp + ')');
  }*/
}

function playSong(encMeasures, notes) {
  for (i = 0; i < encMeasures.length; i++) {
    playMeasure(decode(encMeasures[i]));
  }
  playMeasure(notes);
}

function playMeasureHandler() {
  playMeasure(selected);
}

function playSongHandler() {
  playSong(encMeasures, selected);
}

/////////////////////////////////////////////////
// Update Song
/////////////////////////////////////////////////

function updateSong() {
  updateData = {
    "measure": encode(selected),
  }
  if (songId != "") {
    updateData.songId = songId
  }
  $.post({
    url: '/api/update',
    data: JSON.stringify(updateData),
    contentType: "application/json"
  });
}
