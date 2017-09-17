/////////////////////////////////////////////////
// Profile Stuff
/////////////////////////////////////////////////

var map = new Datamap({element: document.getElementById('map'), scope: 'world'});

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
}