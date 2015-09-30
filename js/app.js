

$(function () {
        $('#location-search').submit(function (event) {
        event.preventDefault();
        userInput = $(event.target).children('[type=text]').val();

        if (userInput.length < 1) {
            alert("Please type a keyword to perform a search");
            $('.search-box').focus();
        } else {
            $('#map').show();
            initMap();
            deleteMarkers();
            $('.search-results').html('');
            getMeetupGroups(userInput);
            $('.search-box').val('').focus();
        };
    });
});

var map;
var markers = [];
var pos;
var markerWindow;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 38.258890099999995, lng: -122.0694764}
    });

    // var infoWindow = new google.maps.InfoWindow({map: map});

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // infoWindow.setPosition(pos);
            // infoWindow.setContent('You are here');
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
    var content = '<div id="content"><p><a href="'+ location.link + '" target=_blank>' + location.name + '</a></p></div>';
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
        // label: labels[labelIndex++ % labels.length],
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
    var result = $('.templates .result .results-list').clone();

    var groupTitle = result.find('.name');
    groupTitle.html( group.name );

    var groupDesc = result.find('.desc');
    groupDesc.html('<p>' + group.description + '</p>')

    var groupLocation = result.find('.location');
    groupLocation.html('<p>' + group.city + ', ' + group.state + '</p>');

    var groupLink = result.find('.page a');
    groupLink.attr('href', group.link);
    groupLink.html('<p>Visit their page</p>');

    return result;
}

function showSearchCount(query, resultNum) {
    var results = resultNum + ' results for <strong>' + query;
    return results;
}

var showError = function(error){
    var errorElem = $('.templates .error').clone();
    var errorText = '<p>' + error + '</p>';
    errorElem.append(errorText);
};

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
        var errorElem = showError(error)
        $('.search-results').append(errorElem);
    });

    return result;
}
