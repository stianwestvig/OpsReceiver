
app.controller('unitsController', function(){
    var units = this;

    units.data = [];

    window.datahubSocket = new WebSocket("ws://nanopils.servebeer.com:2233/ws", "protocolOne");

    datahubSocket.onopen = function (event) {
        datahubSocket.send("OpsCast socket connected");
    };

    datahubSocket.onmessage = function (event) {
        console.log('angular, onmessage:', event);



        // users:
        if (event.data.topic === 'setUser') {
            console.log('units.data', units.data);
            console.log('event.data.payload', event.data.payload);

            if(! $.inArray(event.data.payload.user.id, units.data)) {
                units.data.push(event.data.payload.user)
            }
        }



        // locations:
        if (event.data.topic === 'locationUpdate') {
            var posInArray = $.inArray(event.data.payload.user.id, units.data);
            if (posInArray > 0) {
                var myLatlng = new google.maps.LatLng(
                    event.data.payload.location.latitude,
                    event.data.payload.location.longitude
                );
                var mapOptions = {
                    zoom: 4,
                    center: myLatlng
                };
                var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    title: event.data.payload.user.name
                });

                marker.setMap(map);

                units.data[posInArray].marker = marker;
            }

            console.log('units.data after locationUpdate', units.data);
        }

        messageBus.broadcast(event.data + '; Receiver triggered by datahub was here');

    };



    /*var location = {
        topic: 'locationUpdate',
        payload: {
            location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            }
        },
        user: {}
    };


    var example = {
        topic: 'setUser',
        payload: {
            user: {
                name: username,
                ip: ip,
                source: 'app',
                id: 'some socket id'
            }
        }
    };*/



});