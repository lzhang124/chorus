/////////////////////////////////////////////////
// Profile Stuff
/////////////////////////////////////////////////

var map = new Datamap({element: document.getElementById('map'), scope: 'world',
                      fills: {
                        defaultFill: '#bdbdbd'
                      }, geographyConfig: {
                        borderColor: '#515152',
                        popupOnHover: false,
                      }});
var encMeasures;
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

$('.song').click(function(ev) {
    songId = $(this).attr('data');
    data = {
    "songId": songId,
    };

    $.post({
        url: '/api/tracker',
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(resp) {
            renderView(resp)
        }
    });

    $.get({
        url: '/api/song?songId=' + songId,
        contentType: "application/json",
        success: function(resp) {
          var all_data = [];
          for (var i = 0; i < resp.info.length; i++) {
            all_data.push(decode(resp.info[i]));
          }
          draw(all_data);
          encMeasures = all_data;
        }
    });
});

zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]))

function decode(encNotes) {
var N_ROWS = 25
var N_COLS = 16

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

function draw(encMeasures) {
  d3.selectAll(".measures")
    .remove();

  for (var i = 0; i < encMeasures.length; i++) {
    var div = d3.select("#lines")
                .append("div")
                .attr("id", "dots-" + i)
                .attr("class", "measures");

    drawCantEdit("#dots-" + i, encMeasures[i]);
  }
}

function drawCantEdit(id, selected) {
    var HEIGHT = 200,
        WIDTH = 120,
        R = 3,
        XSPACE = 7,
        YSPACE = 7;

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
                   .classed("dot-slightly-visible", true)
                   .attr("cx", function(d) { return d.x; })
                   .attr("cy", function(d) { return d.y; })
                   .attr("r", R)
                   .classed("dot-selected", function(d) { return d.selected; });

    for (var i = 0; i < rects.length; i++) {
        currRect = rects[i];
        rect = svg.append("rect")
          .attr("x", 12.5 + currRect.start * XSPACE)
          .attr("y", 17 + currRect.row * YSPACE)
          .attr("width", Math.abs(currRect.end - currRect.start) * XSPACE + 2*R)
          .attr("height", 2*R + 1)
          .attr("rx", R)
          .attr("ry", R)
          .style("fill", "#ececec");
    }
}

function renderView (resp) {
    var locations = resp.locations
    var formatted = []
    for (i = 0; i < locations.length; i++) {
        formatted.push({
            origin: {
                latitude: locations[i][0],
                longitude: locations[i][1]
            },
            destination: {
                latitude: resp.self[0],
                longitude: resp.self[1]
            },
            strokeWidth: 4,
            arcSharpness: 1.4,
        });
    }
    map.arc(formatted);
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

function playSong(encMeasures) {
  Tone.Transport.clear();
  var offset = 0;
  for (var i = 0; i < encMeasures.length; i++) {
    var result = " + 0";
    if (i != 0) {
      result = "+ " + "(8n * " + offset.toString() + ")";
    }
    playMeasure(encMeasures[i], result);
    offset += N_COLS
  }
}

function playSongHandler() {
  playSong(encMeasures);
  Tone.Transport.start('+0.01');
}
