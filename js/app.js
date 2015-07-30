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
  // this.imgAttribution = ko.observable(data.imgAttribution);

  // this.title = ko.computed(function(){
  //   var title;
  //   var clicks = this.clickCount;
  //   if (clicks < 10) {
  //     title = 'Newborn';
  //   } else if (clicks < 50) {
  //     title = 'Infant';
  //   } else {
  //     title = 'Ninja';
  //   }
  //   return title;
  // }, this);
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
  })

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