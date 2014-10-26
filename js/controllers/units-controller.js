
app.controller('unitsController', function($rootScope, window){
    var units = this;

    window.unit.data = units.data = {};

 /*   window.messageBus.onMessage = function(event) {

        displayText(event.data);
        // inform all senders on the CastMessageBus of the incoming message event
        // sender message listener will be invoked
        window.messageBus.send(event.senderId, event.data);

        var data = null;
        try {
            data = JSON.parse(event.data);
        }
        catch (ex) {}
        if (data != null) {
            if(data.topic === 'tabChange') {
                var key = data.payload.id;
                units.data[key].active = true;
            }

            if(data.topic === 'senderInit') {
                messageBus.broadcast(JSON.stringify(units.data));
            }
        }
    };
*/

    window.datahubSocket = new WebSocket("ws://nanopils.servebeer.com:2233/ws", "protocolOne");

    datahubSocket.onopen = function (event) {
        datahubSocket.send("OpsCast socket connected");
    };

    datahubSocket.onmessage = function (event) {
        console.log('angular, onmessage:', event);


        // get data json

        var data = null;
        try {
            data = JSON.parse(event.data);
        }
        catch (ex) {}
        if (data != null) {
            console.log('angular, data.topic:', data.topic);



            // users:
            if (data.topic === 'setUser') {
                console.log('units.data', units.data);
                console.log('event.data.payload', data.payload);

                var key = data.payload.user.id;
                if (typeof(units.data[key]) == 'undefined') {
                    console.log('adding new user:', data.payload.user);
                    units.data[key] = data.payload.user;
                    console.log('AFTER adding new user:', units.data);
                    messageBus.broadcast(JSON.stringify(units.data));
                    $rootScope.$apply(function () {
                        units.data[key] = data.payload.user;
                    });
                }
            }

            // set active tab:
            if (data.topic === 'setTab') {
                units.data[key].active = true;
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
        }

    };
});