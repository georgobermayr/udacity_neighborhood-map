/*
Basic map data rendered on the Google map
Each object has:
- Latitude and Longitude for positioning on the map
- Title and Text for search, info windows and list view
- Type for Icons on the map
*/
var initalCoordiantes = [
  {
    latitude: 40.674351,
    longitude: -73.950499,
    title: 'Brooklyn Museum',
    text: 'The Brooklyn Museum is an art museum located in the New York City borough of Brooklyn.',
    type: 'Museum'
  },
  {
    latitude: 40.666457,
    longitude: -73.962110,
    title: 'Brooklyn Botanic Garden',
    text: 'Beautiful 52-acre botanic garden in the heart of Brooklyn.',
    type: 'Garden'
  },
  {
    latitude: 40.690535,
    longitude: -73.990088,
    title: 'New York Transit Museum',
    text: 'The New York Transit Museum, one of the citys leading cultural institutions, is the largest museum in the United States devoted to urban public transportation.',
    type: 'Museum'
  },
  {
    latitude: 40.672920,
    longitude: -73.989977,
    title: 'The Morbid Anatomy Library',
    text: 'The Morbid Anatomy Library is a part of The Morbid Anatomy Museum.',
    type: 'Library'
  },
];

// LoadScript function loads Google maps async and runs
// initialize function after sucessful load
function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
      '&signed_in=true&callback=initialize';
  document.body.appendChild(script);
}

// After Google maps load the Knockout viewModel is initalized
function initialize() {
  ko.applyBindings(new ViewModel());
}

// Knockout data modell
var Coordinate = function(data) {
  this.title = ko.observable(data.title);
  this.text = ko.observable(data.text);
  this.longitude = ko.observable(data.longitude);
  this.latitude = ko.observable(data.latitude);
  this.type = ko.observable(data.type);
}

// Knockout view model function
var ViewModel = function () {
  var self = this;

  // Empty filter variable for search function
  this.myFilter = ko.observable("");

  // Initialze Google map in map-canvas DOM element with New York view
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(40.694853, -73.946722)
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  // Generate observableArray from data
  this.coordianteList = ko.observableArray([]);
  initalCoordiantes.forEach(function(coordiante){
    self.coordianteList.push( new Coordinate(coordiante) );
  });

  // Render the markers on the map
  // Function is used for initial rendering with all markers
  // as well as for the filtering function with selective markers
  this.Markers = function(marker, infowindow, filterString) {

    // First clear all markers for the filter
    for (var i = 0; i < marker.length; i++ ) {
      marker[i].setMap(null);
    }

    // Pass in global marker and infowindow arrays
    var marker = marker;
    var infowindow = infowindow;

    // Generate the regex for filtering title and text
    filterString = new RegExp(filterString,"i");;

    // Iterate through each coordinate
    for (var i = this.coordianteList().length - 1; i >= 0; i--) {

      // Get data from the modell
      longitude = this.coordianteList()[i].longitude();
      latitude = this.coordianteList()[i].latitude();
      title = this.coordianteList()[i].title();
      text = this.coordianteList()[i].text();
      type = this.coordianteList()[i].type();

      // Check if current coordinate is part of the current filter
      inTitle = title.match(filterString);
      inText = text.match(filterString);

      // Generate file path for the map marker icon
      image = 'img/' + type + '.png';

      // Check if regex is true, hence current coordinate
      // is part of the current filter
      // If no filter is present all coordinates are rendered
      if (inTitle || inText) {

        // Generate the Google maps marker with the data
        marker[i] = new google.maps.Marker({
          position: new google.maps.LatLng(latitude, longitude),
          map: map,
          title: title,
          icon: image
        });
        // Integrate an index in the current marker array,
        // used for mapping it to its info window
        marker[i].index = i;

        // Generate the Google maps info window with the data
        infowindow[i] = new google.maps.InfoWindow({
          content: text
        });

        // Call the dataCall function for fetching information from
        // Wikipedia and Google Street View in the current info window
        this.dataCall(latitude, longitude, infowindow[i], title);

        // Generate the event listener for opening the info window
        // when clicking on the map marker
        google.maps.event.addListener(marker[i], 'click', function() {
          // Close all other windows when this window is opendend
          for (var i = infowindow.length - 1; i >= 0; i--) {
            infowindow[i].close();
          };
          infowindow[this.index].open(map,marker[this.index]);
          map.panTo(marker[this.index].getPosition());
        });
      };
    };
    // Return marker and infowindow arrays to the global scope
    return [marker, infowindow];
  }

  // dataCall function for fetching data from external sources
  // and rendering it into the current info window
  this.dataCall = function(lat, long, infowindow, title) {

    // Generate the Wikipedia API call URL
    var titleURL = title.replace(/ /g, '%20');
    var wikipediaUrl = 'http://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+titleURL;

    // URL for the Google Street view image
    var streetviewUrl = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location='+latitude+','+longitude;

    // AJAX call to the Wikipedia API
    $.ajax({
        url: wikipediaUrl,
        dataType: "jsonp",
        success: function( response ) {

          // Get the extract text from the Wikipedia response
          extract = response.query.pages[Object.keys(response.query.pages)[0]].extract;

          // Check if there is a extract from Wikipedia for this POI
          if (extract) {

            // Update the info window content with Wikipedia and Street view
            infowindowContent = '<strong>Wikipedia Description: </strong>'+extract+'<hr>';
            infowindowContent = infowindowContent + '<img src="'+streetviewUrl+'" alt="" /><br>'+'Google Street View';
            infowindow.setContent(infowindowContent);
          } else {

            // If no extract is avialible form Wikipedia, just use
            // the street view image and the standard text content from
            // the model
            infowindowContent = infowindow.content + '<hr>' + '<img src="'+streetviewUrl+'" alt="" /><br>'+'Google Street View';
            infowindow.setContent(infowindowContent);
          };
        },
        error: function() {}
    });
  }

  // Filter function is called when user hits the search bar
  this.filter = function() {
    this.Markers(marker, infowindow, this.myFilter());
  }

  // Calling the Markers function with empty arrays
  // Marker and info window variables are returned by the function
  var elements = this.Markers([], []);
  marker = elements[0];
  infowindow = elements[1];

}

// loadScript-Function is loaded on window load
window.onload = loadScript;