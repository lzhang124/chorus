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
    }
    $.post({
        url: '/api/tracker',
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(resp) {
            renderView(resp)
        }
    })
})

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
