
app.controller('unitsController', function(){
    var units = this;

    units.data = [];

    window.datahubSocket = new WebSocket("ws://nanopils.servebeer.com:2233/ws", "protocolOne");

    datahubSocket.onopen = function (event) {
        datahubSocket.send("OpsCast socket connected");
    };

    datahubSocket.onmessage = function (event) {
        console.log('angular, onmessage:', event);


        // get data json

        var data = JSON.parse(event.data);
        console.log('angular, data.topic:', data.topic);



        // users:
        if (data.topic === 'setUser') {
            console.log('units.data', units.data);
            console.log('event.data.payload', data.payload);

            if(! $.inArray(data.payload.user.id, units.data)) {
                units.data.push(data.payload.user)
            }
        }



        // locations:
        if (data.topic === 'locationUpdate') {
            var posInArray = $.inArray(data.payload.user.id, units.data);
            if (posInArray > 0) {
                var myLatlng = new google.maps.LatLng(
                    data.payload.location.latitude,
                    data.payload.location.longitude
                );
                var mapOptions = {
                    zoom: 4,
                    center: myLatlng
                };
                var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    title: data.payload.user.name
                });

                marker.setMap(map);

                units.data[posInArray].marker = marker;
            }

            console.log('units.data after locationUpdate', units.data);
        }

        messageBus.broadcast(data + '; Receiver triggered by datahub was here');

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