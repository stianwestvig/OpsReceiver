function setupDataHubCommunication() {
	var datahubSocket = new WebSocket("ws://nanopils.servebeer.com:2233/ws", "protocolOne");

	datahubSocket.onopen = function (event) {
		datahubSocket.send("OpsCast socket connected"); 
	};

	datahubSocket.onmessage = function (event) {
		console.log(event);
		displayText(event.data);
	}
}

