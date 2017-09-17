/////////////////////////////////////////////////
// Profile Stuff
/////////////////////////////////////////////////

var svg = d3.select("#map").append("svg")

var projection = d3.geoMercator()

var path = d3.geoPath()
  .projection(projection);

var arcs = svg.append("g")
        .attr("class","arcs");

var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
d3.json(url, function(err, geojson) {
  svg.append("path")
    .attr("d", path(geojson))
    .style("fill", "#ececec")
})

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
    svg.selectAll("g").remove();
    arcs = svg.append("g")
            .attr("class","arcs");
    to = resp.self
    arcdata = []
    for (i=0; i < resp.locations.length; i++) {
        arcdata.push({
            'source': to,
            'target': resp.locations[i]
        })
    }
    arcs.selectAll("path")
        .data(arcdata)
        .enter()
        .append("path")
        .attr('d', function(d) { 
            return lngLatToArc(d, 'source', 'target', 15); // A bend of 5 looks nice and subtle, but this will depend on the length of your arcs and the visual look your visualization requires. Higher number equals less bend.
        });
}

function lngLatToArc(d, sourceName, targetName, bend){
  // If no bend is supplied, then do the plain square root
  bend = bend || 1;
  // `d[sourceName]` and `d[targetname]` are arrays of `[lng, lat]`
  // Note, people often put these in lat then lng, but mathematically we want x then y which is `lng,lat`

  var sourceLngLat = d[sourceName],
      targetLngLat = d[targetName];

  if (targetLngLat && sourceLngLat) {
    var sourceXY = projection( sourceLngLat ),
        targetXY = projection( targetLngLat );

    // Uncomment this for testing, useful to see if you have any null lng/lat values
    // if (!targetXY) console.log(d, targetLngLat, targetXY)
    var sourceX = sourceXY[0],
        sourceY = sourceXY[1];

    var targetX = targetXY[0],
        targetY = targetXY[1];

    var dx = targetX - sourceX,
        dy = targetY - sourceY,
        dr = Math.sqrt(dx * dx + dy * dy)*bend;

    // To avoid a whirlpool effect, make the bend direction consistent regardless of whether the source is east or west of the target
    var west_of_source = (targetX - sourceX) < 0;
    if (west_of_source) return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
    return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
    
  } else {
    return "M0,0,l0,0z";
  }
}
