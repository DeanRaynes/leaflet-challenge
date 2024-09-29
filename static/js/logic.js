function createMap(earthquakes) {

      // Create the tile layer that will be the background of our map.
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' , {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
      // Create a baseMaps object to hold the lightmap layer.
    var baseMaps = {
      "Street Map": streetmap
    };
  
      // Create an overlayMaps object to hold the earthquakes layer.
    var overlayMaps = {
      "earthquakes": earthquakes
    };
  
      // Create the map object with options centered over innermtn.
    var map= L.map("map", {
      center: [40.76, -111.8910],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });

      // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    // Create a legend for depth of earthquake in bottom right
  var depthLegend = L.control({position: "bottomright"});

  depthLegend.onAdd = function() {
    var div = L.DomUtil.create('div', 'legend-container'),
      depthRanges = [-10, 10, 30, 50, 70, 90];
      
      // Title of legend
    div.innerHTML += "<h4>Depth</h4>";
      
      // Loop through depth ranges to to add colors from getColor
    for (var i = 0; i < depthRanges.length; i++) {
      div.innerHTML +=
        '<i style = "background:' + getColor(depthRanges[i] + 1) + '; width: 18px; height: 14px; display: inline-block; margin-right: 5px;"></i> ' +
        depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+');
    }
    return div;
  };

  depthLegend.addTo(map);

    // Create a legend for magnitude of earthquakes
  var sizeLegend = L.control({ position: "bottomleft" });

    sizeLegend.onAdd = function() {
      var div = L.DomUtil.create('div', 'legend-container'),
        magnitudes = [1, 2, 3, 4, 5, 6, 7];  
      
        // Add title for magnitude
      div.innerHTML += "<h4>Magnitude</h4>"; 

        // Loop through magnitude values and add corresponding circle sizes
      for (var i = 0; i < magnitudes.length; i++) {
        div.innerHTML +=
          '<i style="background: none; border-radius: 50%; width: ' + getRadius(magnitudes[i]) * 2 + 'px; height: ' + getRadius(magnitudes[i]) * 2 + 'px; display: inline-block; border: 2px solid black;"></i> ' +
          magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
      }
      return div;
    };

    sizeLegend.addTo(map);
}

  // Create color scale for markers and legend
function getColor(depth) {
  return depth > 90 ? 'orangered' :
         depth > 70 ? 'orange' :
         depth > 50 ? 'goldenrod' :
         depth > 30 ? 'gold' :
         depth > 10 ? 'yellowgreen' :
                      'limegreen';
}

  // Create radius size for magnitude legend
function getRadius(magnitude) {
  return magnitude * 2; 
}

function createMarkers(response) {

    // Pull the "features" property from response.data.
  var features = response.features;

    // Initialize an array to hold quake markers.
  var quakeMarkers = [];

    // Loop through the features array.
  features.forEach((feature) => {
    var coords = feature.geometry.coordinates;
    var mag = feature.properties.mag;
    var place = feature.properties.place;
    var time = feature.properties.time;
    var depth = coords[2];

      // For each feature, create a marker, and bind a popup with the quakes detail.
    var quakeMarker = L.circleMarker([coords[1], coords[0]], {
      radius: mag * 2,
      fillColor: getColor(depth),
      weight: 0.5,
      opacity: 0.5,
      fillOpacity: 1 
    }).bindPopup(`<h3>Magnatude: ${mag}</h3>
                  <h3>Depth: ${depth}</h3>
                  <h3>Location: ${place}</h3>
                  <h3>Time: ${new Date(time)}</h3>`);

      // Add the marker to the quakeMarkers array.
    quakeMarkers.push(quakeMarker);
  });

    // Create a layer group that's made from the quake markers array, and pass it to the createMap function.
  createMap(L.layerGroup(quakeMarkers));
}


// Perform an API call to the usgs earthquake API to get the station information. Call createMarkers when it completes.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
