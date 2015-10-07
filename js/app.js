$(function () {
  $('#location-search').submit(function (event) {
    event.preventDefault();
    var userInput = $(event.target).children('[type=text]').val();
    $('#map').show();
    // console.log(window);
    deleteMarkers();
    $('.search-results').html('');
    getMeetupGroups(userInput);
    $('.search-box').val('').focus();
  });
  $('.search-results').on('click', '.next-page', function (e) {
    e.preventDefault();

  });
});

// Global Variables

var map;
var markers = [];
var pos;
var gm = google.maps;
// var markerWindow = gm.InfoWindow();

// Handles Geolocation errors

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed' : 'Error: Your browser doesn\'t support geolocation.');
}

// Initialize the Map and load location based on user location

// window.onload = function () {
//   var gm = google.maps;
//   var nav = navigator.geolocation;
//   var iw = new gm.InfoWindow();
//   var oms = new OverlappingMarkerSpiderfier(map);

//   map = new gm.Map(document.getElementById('map'), {
//     zoom: 10,
//     center: {lat: 38.258890099999995, lng: -122.0694764},
//     scrollwheel: false
//   });

//   oms.addListener('click', function(marker) {
//     iw.setContent(marker.desc);
//     iw.open(map, marker);
//   });
//   oms.addListener('spiderfy', function(markers) {
//     iw.close();
//   });

//   for (var i = 0; i < window.mapData.length; i++) {
//     var datum = window.mapData[i];
//     var loc = new gm.LatLng(datum.lat, datum.lon);
//     var marker = new gm.Marker({
//       position: loc,
//       title: datum.h,
//       map: map
//     });
//     marker.desc = datum.d;
//     oms.addMarker(marker);
//   }

//   if (nav) {
//     nav.getCurrentPosition(function (position) {
//       pos = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//       };

//     map.setCenter(pos);
//     }, function () {
//       handleLocationError(true, infoWindow, map.getCenter());
//     });
//   } else {
//     handleLocationError(false, infoWIndow, map.getCenter());
//   }
//   window.map = map;
//   window.oms = oms;
// }

function initMap() {
  var nav = navigator.geolocation;

  map = new gm.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat: 38.258890099999995, lng: -122.0694764},
    scrollwheel: false
  });

  if (nav) {
    nav.getCurrentPosition(function (position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

    map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWIndow, map.getCenter());
  }
}

// Shows markers on map for group locations if available

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function clearMarkers() {
  setMapOnAll(null);
}

function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function showMapMarkers(location) {
  var oms = new OverlappingMarkerSpiderfier(map);
  var content = '<div id="content"><p><a href="'+ location.link + '" target=_blank>' + location.name + '</a></p></div>';
  var coordinates = {
    lat: location.lat,
    lng: location.lon
  };    
  var marker = new gm.Marker({
    map: map,
    position: coordinates,
    title: location.name,
    animation: google.maps.Animation.DROP
  });

  var markerWindow = new gm.InfoWindow();

  // marker.addListener('click', function() {
  //   markerWindow.setContent(content);
  //   markerWindow.open(map, marker);
  // });

  oms.addListener('click', function(marker, event) {
    markerWindow.setContent(content);
    markerWindow.open(map, marker);
  });

  oms.addListener('spiderfy', function(markers) {
    markerWindow.close();
  });

  markers.push(marker);
  
  setMapOnAll(map);
}

// Displays search results

function showResults(group) {
  var displayResults = $('.templates .result .results-list').clone();

  var groupTitle = displayResults.find('.name');
  groupTitle.html( group.name );

  var groupDesc = displayResults.find('.desc');
  groupDesc.html('<p>' + group.description + '</p>')

  var groupLocation = displayResults.find('.location');
  groupLocation.html('<p>' + group.city + ', ' + group.state + '</p>');

  var groupLink = displayResults.find('.page a');
  groupLink.attr('href', group.link);
  groupLink.html('<p>Visit their page</p>');

  initMap();

  return displayResults;
}

// Displays number of results for search

function showSearchCount(query, resultNum) {
  var resultCount = resultNum + ' results for <strong>"' + query + '" in your area';
  return resultCount;
}

var showError = function(error){
  var errorElem = $('.templates .error').clone();
  var errorText = '<p>' + error + '</p>';
  errorElem.append(errorText);
};

function makeAjaxRequest(request) {
  var ajaxRequest;
  if ( typeof request === 'object' ) {
    ajaxRequest = {
      url: 'https://api.meetup.com/find/groups',
      data: request,
      dataType: 'jsonp',
      type: 'GET'
    };
  } else if ( typeof request === 'string' ) {
    ajaxRequest = request;
  }
  var result = $.ajax( ajaxRequest ).done(function(result) {
      // console.log(result);
      // console.log(request.text);
      var searchResults = showSearchCount(request.text, result.meta.total_count);

      $('.search-results').append('<h4>' + searchResults + '</h4>');
    
      $.each(result.data, function(i, item) {
        console.log(item.lat);
        console.log(item.lon);
        $('.search-results').append(showResults(item));
        showMapMarkers(item);
      });
      if ( result.meta.next_link ) {
        $('.search-results').append('<a class="next-page" href="#">Next Page</a>');
      } else {
        return false;
      }
    }).fail(function(jqXHR, error, errorThrown) {
      var errorElem = showError(error);

      $('.search-results').append(errorElem);
    });
  return result;
}

// Requests data from Meetup API to find groups

function getMeetupGroups(query) {
  var params = {
    sign: 'true',
    key: '527e5759286c5e3562a144744e21a',
    page: 10,
    lat: pos.lat,
    lon: pos.lng,
    radius: 20,
    order: 'distance',
    text: query,
    callback: 'gotIt'
  }
  return makeAjaxRequest( params );
}
