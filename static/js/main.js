var N_ROWS = 25
var N_COLS = 16

var WIDTH = 555;
var HEIGHT = 755;
var R = 10;
var XSPACE = 35;
var YSPACE = 30;

var NOTES = ['C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4',
             'D4', 'C#4', 'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3',
             'E3', 'D#3', 'D3', 'C#3', 'C3'];

var synth = new Tone.PolySynth().toMaster();
Tone.Transport.bpm.value = 120

/////////////////////////////////////////////////
// Load song
/////////////////////////////////////////////////

var songId = "";
var encMeasures = 0;

function getSong() {
  $.get({
    url: "/api/get_random",
    success: function(resp) {
      songId = resp.response;
      encMeasures = resp.info;

      var all_data = [];
      
      for (var i = 0; i < encMeasures.length; i++) {
        all_data.push(decode(encMeasures[i]));
      }
      $('#dots-containers').scrollLeft(0);
      drawExisting(all_data);
    }
  });
}

window.onload = function() {
  d3.selectAll(".half-width")
    .append("svg")
    .attr("height", HEIGHT)
    .attr("width", ($(window).width() - WIDTH)/2);
  getSong();
}

/////////////////////////////////////////////////
// Front end
/////////////////////////////////////////////////

var deletedRect = false;

function indexOfCustom (parentArray, searchElement) {
    for ( var i = 0; i < parentArray.length; i++ ) {
        if ( parentArray[i][0] == searchElement[0] || parentArray[i][1] == searchElement[1] ) {
            return i;
        }
    }
    return -1;
}

var div = d3.select("#dots");

var svg = div.append("svg")
             .attr("height", HEIGHT)
             .attr("width", WIDTH);

var selected = [];
for (var i = 0 ; i < 25; i++) {
  selected.push([]);
}

var data = [];

for (var i = 0; i < 16; i++) {
  data.push([]);
  for (var j = 0; j < 25; j ++) {
    data[i].push({
      col: i,
      row: j,
      x: 15 + i*XSPACE,
      y: 20 + j*YSPACE
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
               .attr("r", R)
               .on('mouseover', dotMouseover)
               .on('mouseout', dotMouseout);

svg.call(drawRect);

function dotMouseover(d) {
  d3.select(this).classed("dot-hover", true);
}

function dotMouseout(d) {
  d3.select(this).classed("dot-hover", false);
}


function invert(point) {
  var x = point[0],
      y = point[1];
  var x_adj = Math.max(Math.round((x - 15) / XSPACE), 0);
  var y_adj = Math.max(Math.round((y - 20) / YSPACE), 0);
  if (x_adj > 15) {
    x_adj = 15;
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
                        .attr("x", 5 + x * XSPACE)
                        .attr("y", 9.5 + y * YSPACE)
                        .attr("rx", R)
                        .attr("ry", R)
                        .style("fill", "#ececec");
              var circle = d3.select(".y-" + x + " .x-" + y);
              if (!deletedRect) {
                circle.classed("dot-selected", !circle.classed("dot-selected"));
              }
              if (circle.classed("dot-selected")) {
                synth.triggerAttack(NOTES[y]);
              }
            })
           .on('mouseup', function() {
                keep = false;
                if (!deletedRect) {
                  var inverted = invert(d3.mouse(this));
                  currx = inverted.x;
                  if (rect) {
                    rect.attr("width", Math.abs(currx - x) * XSPACE + R*2)
                        .on("mousedown", rectClick);
                  }
                  var range = [Math.min(x, currx), Math.max(x, currx)];
                  var index = indexOfCustom(selected[inverted.y], range);

                  if (index === -1) {
                    selected[y].push(range);
                  } else if (currx === x) {
                    // delete if clicking on a circle that is already filled
                    selected[y].splice(index, 1);
                  }
                  synth.triggerRelease(NOTES[y]);
                } else {
                  deletedRect = false;
                }
            })
           .on('mousemove', function() {
              if (keep && !deletedRect) {
                var curr = d3.mouse(this);
                var inverted = invert(curr);
                currx = inverted.x
                rect.attr("width", Math.abs(currx - x) * XSPACE + R*2)
                    .attr("height", R*2 + 1);
                if (curr[0] - point[0] < 0) {
                  rect.attr("x", 5 + currx * XSPACE);
                }
                if (currx !== x) {
                  var circle_class = ".y-" + currx + " .x-" + y;
                  d3.select(circle_class).classed("dot-selected", true);
                }
              }
            })
}
function clearNotes() {
  svg.selectAll(".dot-selected")
    .classed("dot-selected", false);

  svg.selectAll("rect")
    .remove();

  selected = [];
  for (var i = 0 ; i < 25; i++) {
      selected.push([]);
  }
}

function rectClick() {
  var inverted = invert(d3.mouse(this));
  var bar = selected[inverted.y].filter((elem) => { return inverted.x >= elem[0] && inverted.x <= elem[1]; });

  if (bar.length > 0) {
    bar = bar[0];
    d3.select(this).remove();
    for (var i = bar[0]; i <= bar[1]; i++) {
      var circle_class = ".y-" + i + " .x-" + inverted.y;
      d3.select(circle_class).classed("dot-selected", false);
    }

    index = indexOfCustom(selected[inverted.y], bar);
    selected[inverted.y].splice(index, 1);

    deletedRect = true;
  }
}

function drawCantEdit(id, selected) {
    var svg = d3.select(id)
                .append("svg")
                .attr("height", HEIGHT)
                .attr("width", WIDTH);

    var data = [];

    for (var i = 0; i < 16; i++) {
      data.push([]);
      for (var j = 0; j < 25; j ++) {
        data[i].push({
          col: i,
          row: j,
          x: 15 + i*XSPACE,
          y: 20 + j*YSPACE,
          selected: false
        });
      }
    }

    //mark all the dots first
    var rects = []
    for (var row = 0; row < selected.length; row++) {
      for (var i = 0; i < selected[row].length; i++) {
        elem = selected[row][i];
        start = elem[0];
        end = elem[1];
        if (start == end) {
          data[start][row].selected = true;
        } else {
          rects.push({start: start, end: end, row: row});
        }
      }
    }

    var cols = svg.selectAll(".col")
                  .data(data)
                  .enter()
                  .append("g")
                  .classed("col", true);

    var dots = cols.selectAll(".dot-not-visible")
                   .data(function(d) { return d; })
                   .enter()
                   .append("circle")
                   .classed("dot-not-visible", true)
                   .attr("cx", function(d) { return d.x; })
                   .attr("cy", function(d) { return d.y; })
                   .attr("r", R)
                   .classed("dot-selected", function(d) { return d.selected; });

    for (var i = 0; i < rects.length; i++) {
        currRect = rects[i];
        rect = svg.append("rect")
          .attr("x", 5 + currRect.start * XSPACE)
          .attr("y", 9.5 + currRect.row * YSPACE)
          .attr("width", Math.abs(currRect.end - currRect.start) * XSPACE + 2*R)
          .attr("height", 2*R + 1)
          .attr("rx", R)
          .attr("ry", R)
          .style("fill", "#ececec");
    }
};

function drawExisting(encMeasures) {
  clearNotes();
  d3.selectAll(".measures")
    .selectAll("svg")
    .remove();

  for (var i = 0; i < encMeasures.length; i++) {
    var div = d3.select("#lines")
                .append("div")
                .attr("id", "dots-" + i)
                .attr("class", "measures");

    drawCantEdit("#dots-" + i, encMeasures[i]);
  }
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

function playMeasure(notes, offset) {
  Tone.Transport.clear();
  for (var i = 0; i < notes.length; i++) {
    for (var j = 0; j < notes[i].length; j++) {
      let start = notes[i][j][0];
      let end = notes[i][j][1];
      let duration = end - start + 1;
      let note = NOTES[i];
      Tone.Transport.schedule(function(time) {
        synth.triggerAttackRelease(note, '8n * ' + duration.toString(), time);
      }, '+8n * ' + start.toString() + offset);
    }
  }
}

function playSong(encMeasures, notes) {
  Tone.Transport.clear();
  var offset = 0;
  for (var i = 0; i < encMeasures.length; i++) {
    var result = " + 0";
    if (i != 0) {
      result = "+ " + "(8n * " + offset.toString() + ")";
    }
    playMeasure(decode(encMeasures[i]), result);
    offset += N_COLS
  }
  playMeasure(notes, "+ " + "(8n * " + offset.toString() + ")");
}

function playMeasureHandler() {
  $('#dots-containers').scrollLeft(encMeasures.length * WIDTH);
  playMeasure(selected, "");
  Tone.Transport.start('+0.01');
}

function playSongHandler() {
  $('#dots-containers').scrollLeft(0);
  $('#dots-containers').delay(2000).animate({
    scrollLeft: encMeasures.length * WIDTH
  }, encMeasures.length * 4000, 'linear');

  playSong(encMeasures, selected);
  Tone.Transport.start('+0.01');
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
    contentType: "application/json",
    success: function(resp) {
      getSong();
    }
  });
}
