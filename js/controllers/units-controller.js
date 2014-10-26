
app.controller('unitsController', function($rootScope){
    var units = this;
    var messageBus = null;
    var datahubSocket = null;

    units.data = {};

    function init() {
        setupCastCommunication();
        setupDatahubCommunication();
    }

    function setupCastCommunication() {
        cast.receiver.logger.setLevelValue(0);
        window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        console.log('Starting Receiver Manager');

        // handler for the 'ready' event
        castReceiverManager.onReady = function(event) {
            console.log('Received Ready event: ' + JSON.stringify(event.data));
            window.castReceiverManager.setApplicationState("Application status is ready...");
        };

        // handler for 'senderconnected' event
        castReceiverManager.onSenderConnected = function(event) {
            console.log('Received Sender Connected event: ' + event.data);
            console.log(window.castReceiverManager.getSender(event.data).userAgent);
        };

        // handler for 'senderdisconnected' event
        castReceiverManager.onSenderDisconnected = function(event) {
            console.log('Received Sender Disconnected event: ' + event.data);
            if (window.castReceiverManager.getSenders().length == 0) {
                window.close();
            }
        };

        // handler for 'systemvolumechanged' event
        castReceiverManager.onSystemVolumeChanged = function(event) {
            console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' +
                    event.data['muted']);
        };

        // create a CastMessageBus to handle messages for a custom namespace
        window.messageBus = messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:no.bouvet.cast.opscast');


        window.messageBus.onMessage = function(event) {
            console.log('Message [' + event.senderId + ']: ' + event.data);
            // display the message from the sender
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
                    console.log('TabChange: data = ');
                    console.log(data);
                    var key = data.payload.id;
                    units.data[key].active = true;
                }

                if(data.topic === 'senderInit') {
                    window.messageBus.broadcast(JSON.stringify(units.data));
                }
            }
        };

        // initialize the CastReceiverManager with an application status message
        window.castReceiverManager.start({statusText: "Application is starting"});
        console.log('Receiver Manager started');

    }

    function setupDatahubCommunication() {
        window.datahubSocket = datahubSocket = new WebSocket("ws://nanopils.servebeer.com:2233/ws", "protocolOne");

        window.datahubSocket.onopen = function (event) {
            datahubSocket.send("OpsCast socket connected");
        };

        window.datahubSocket.onmessage = function (event) {
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
    }

    init();
});