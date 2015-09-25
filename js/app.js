$(function () {
    $('#location-search').submit(function (event) {
        event.preventDefault();
        var userInput = $(event.target).children('[type=text]').val();
        deleteMarkers();
        $('.search-results').html('');
        getMeetupGroups(userInput);
        $('.search-box').val('').focus();
    });
});

var map;
var markers = [];

window.initMap = function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 38.258890099999995, lng: -122.0694764}
    });

    var infoWindow = new google.maps.InfoWindow({map: map});

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here');
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        handleLocationError(false, infoWIndow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed' :
        'Error: Your browser doesn\'t support geolocation.');
}

function showMapMarkers(location) {

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
    markers.push(marker);
}

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
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

function showResults(group) {
    var result = $('.templates .groups').clone();

    var groupName = result.find('.name');
    groupName.html('<p>' + group.name + '</p>');

    var groupDesc = result.find('.desc');
    groupDesc.html('<p>' + group.description + '</p>')

    var groupLocation = result.find('.location');
    groupLocation.html('<p>' + group.city + ', ' + group.state + '</p>');

    var groupLink = result.find('.page a');
    groupLink.attr('href', group.link);
    groupLink.html('<p>Visit their page</p>');

    return result;
}

function getMeetupGroups(query) {
    var params = {
        sign: 'true',
        key: '527e5759286c5e3562a144744e21a',
        page: 10,
        text: query,
        callback: 'gotIt'
    }
    var result = $.ajax({
        url: 'https://api.meetup.com/find/groups',
        data: params,
        dataType: 'jsonp',
        type: 'GET'
    }).done(function(result) {
        $.each(result.data, function(i, item) {
            // showResults(item);
            $('.search-results').append(showResults(item));
            // initMap(item);
            showMapMarkers(item);
            console.log(item);
        });
    });
    return result;
}
