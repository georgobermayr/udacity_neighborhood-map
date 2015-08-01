var initalCoordiantes = [
  {
    latitude: 40.674351,
    longitude: -73.950499,
    title: 'Brooklyn Museum',
    text: 'The Brooklyn Museum is an art museum located in the New York City borough of Brooklyn.',
  },
  {
    latitude: 40.666457,
    longitude: -73.962110,
    title: 'Brooklyn Botanic Garden',
    text: 'Beautiful 52-acre botanic garden in the heart of Brooklyn.',
  },
  {
    latitude: 40.690535,
    longitude: -73.990088,
    title: 'New York Transit Museum',
    text: 'The New York Transit Museum, one of the citys leading cultural institutions, is the largest museum in the United States devoted to urban public transportation.',
  },
  {
    latitude: 40.672920,
    longitude: -73.989977,
    title: 'The Morbid Anatomy Library',
    text: 'The Morbid Anatomy Library is a part of The Morbid Anatomy Museum.',
  },
];

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
      '&signed_in=true&callback=initialize';
  document.body.appendChild(script);
}

function initialize() {
  ko.applyBindings(new ViewModel());
}

var Coordinate = function(data) {
  this.title = ko.observable(data.title);
  this.text = ko.observable(data.text);
  this.longitude = ko.observable(data.longitude);
  this.latitude = ko.observable(data.latitude);
}

var ViewModel = function () {
  var self = this;

  this.myFilter = ko.observable("");

  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(40.694853, -73.946722)
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  this.coordianteList = ko.observableArray([]);

  initalCoordiantes.forEach(function(coordiante){
    self.coordianteList.push( new Coordinate(coordiante) );
  });

  this.Markers = function(marker, infowindow, filterString) {

    for (var i = 0; i < marker.length; i++ ) {
      marker[i].setMap(null);
    }

    var marker = marker;
    var infowindow = infowindow;
    filterString = new RegExp(filterString,"i");;

    for (var i = this.coordianteList().length - 1; i >= 0; i--) {
      longitude = this.coordianteList()[i].longitude();
      latitude = this.coordianteList()[i].latitude();
      title = this.coordianteList()[i].title();
      text = this.coordianteList()[i].text();

      inTitle = title.match(filterString);
      inText = text.match(filterString);

      if (inTitle || inText) {
        marker[i] = new google.maps.Marker({
          position: new google.maps.LatLng(latitude, longitude),
          map: map,
          title: title
        });
        marker[i].index = i;

        infowindow[i] = new google.maps.InfoWindow({
          content: text
        });

        this.wikipedia(latitude, longitude, infowindow[i], title);

        google.maps.event.addListener(marker[i], 'click', function() {
          for (var i = infowindow.length - 1; i >= 0; i--) {
            infowindow[i].close();
          };
          infowindow[this.index].open(map,marker[this.index]);
          map.panTo(marker[this.index].getPosition());
        });
      };

    };
    return [marker, infowindow];
  }



  this.wikipedia = function(lat, long, infowindow, title) {
    console.log(infowindow.content);
    var titleURL = title.replace(/ /g, '%20');
    var wikipediaUrl = 'http://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+titleURL;

    var streetviewUrl = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location='+latitude+','+longitude;

    $.ajax({
        url: wikipediaUrl,
        dataType: "jsonp",
        success: function( response ) {
          extract = response.query.pages[Object.keys(response.query.pages)[0]].extract;
          if (extract) {
            infowindowContent = '<strong>Wikipedia Description: </strong>'+extract+'<hr>';
            infowindowContent = infowindowContent + '<img src="'+streetviewUrl+'" alt="" /><br>'+'Google Street View';
            infowindow.setContent(infowindowContent);
          } else {
            infowindowContent = infowindow.content + '<hr>' + '<img src="'+streetviewUrl+'" alt="" /><br>'+'Google Street View';
            infowindow.setContent(infowindowContent);
          };
        },
        error: function() {}
    });
  }

  this.filter = function() {
    this.Markers(marker, infowindow, this.myFilter());
  }

  // this.currentCat = ko.observable( this.catList()[0] );

  // this.incrementCounter = function() {
  //   self.currentCat().clickCount(self.currentCat().clickCount() + 1);
  // };

  // this.setCat = function(clickedCat) {
  //   self.currentCat(clickedCat)
  // }

  var elements = this.Markers([], []);
  marker = elements[0];
  infowindow = elements[1];

}

window.onload = loadScript;