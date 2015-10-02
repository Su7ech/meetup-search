// $(function () {
//   // beginSearch();
//   // $('#location-search').submit(function (event) {
//   //   event.preventDefault();
//   //   var userInput = $(event.target).children('[type=text]').val();
//   //   $('#map').show();
//   //   // deleteMarkers();
//   //   $('.search-results').html('');
//   //   // getMeetupGroups(userInput);
//   //   $('.search-box').val('').focus();
//   // });
// });

// Global Variables

var map;
var markers = [];
var pos;
var markerWindow;

// Handles Geolocation errors

var handleLocationError = function (browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed' : 'Error: Your browser doesn\'t support geolocation.');
}

// Initialize the Map and load location based on user location

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {
      lat: 38.258890099999995,
      lng: -122.0694764
    }
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    handleLocationError(false, infoWIndow, map.getCenter());
  };
}

// Shows markers on map for group locations if available

function showMapMarkers(location) {
  var content = '<div id="content"><p><a href="' + location.link + '" target=_blank>' + location.name + '</a></p></div>';
  markerWindow = new google.maps.InfoWindow({
    content: content
  });
  var coordinates = {
    lat: location.lat,
    lng: location.lon
  };
  var marker = new google.maps.Marker({
    map: map,
    position: coordinates,
    title: location.name,
    animation: google.maps.Animation.DROP
  });
  marker.addListener('click', function() {
    markerWindow.setContent(content);
    markerWindow.open(map, marker);
  });
  markers.push(marker);
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  };
}

function clearMarkers() {
  setMapOnAll(null);
}

function showMarkers() {
  setMapOnAll(map);
}

function deleteMarkers() {
  clearMarkers();
  markers = [];
}

// Displays search results

function showResults(group) {
  deleteMarkers();
  var result = $('.templates .result .results-list').clone();

  var groupTitle = result.find('.name');
  groupTitle.html(group.name);

  var groupDesc = result.find('.desc');
  groupDesc.html('<p>' + group.description + '</p>');

  var groupLocation = result.find('.location');
  groupLocation.html('<p>' + group.city + ', ' + group.state + '</p>');

  var groupLink = result.find('.page a');
  groupLink.attr('href', group.link);
  groupLink.html('<p>Visit their page</p>');

  initMap();

  return result;
}

// Displays number of results for search

function showSearchCount(query, resultNum) {
  var resultCount = resultNum + ' results for <strong>"' + query + '"';
  return resultCount;
}

function showError(error) {
  var errorElem = $('.templates .error').clone();
  var errorText = '<p>' + error + '</p>';
  errorElem.append(errorText);
};

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
  };
  var result = $.ajax({
    url: 'https://api.meetup.com/find/groups',
    data: params,
    dataType: 'jsonp',
    type: 'GET'
  }).done(function(result) {
    var searchResults = showSearchCount(params.text, result.data.length);

    $('.search-results').html('<h4>' + searchResults + '</h4>');

    $.each(result.data, function(i, item) {
      $('.search-results').append(showResults(item));
      showMapMarkers(item);
    });
  }).fail(function(jqXHR, error, errorThrown) {
    var errorElem = showError(error);

    $('.search-results').append(errorElem);
  });

  return result;
}

// Submit

function beginSearch() {
  $('#location-search').submit(function (event) {
    event.preventDefault();
    var userInput = $(event.target).children('[type=text]').val();
    $('#map').show();
    $('.search-results').html('');
    getMeetupGroups(userInput);
    $('.search-box').val('').focus();
  });
}