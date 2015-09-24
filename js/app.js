$(function () {
    $('#location-search').submit(function (event) {
        event.preventDefault();
        var userInput = $(event.target).children('[type=text]').val();

        $('.search-results').html('');
        getMeetupGroups(userInput);
        $('.search-box').val('').focus();
    })
});

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
            // console.log(item);
        });
    });
    return result;
}