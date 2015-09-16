// "good" service
// var SERVICE = 'd000';
// var READ_CHARACTERISTIC = 'd001';
// var WRITE_CHARACTERISTIC = 'd002';
// var NOTIFY_CHARACTERISTIC = 'd003';

// "bad" service with duplicate uuids
var SERVICE = 'e000';
var READ_CHARACTERISTIC = 'e001';
var WRITE_CHARACTERISTIC = 'e001';
var NOTIFY_CHARACTERISTIC = 'e001';

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        //app.scanAndConnect();
        scanButton.onclick = app.scanAndConnect;
        readButton.onclick = app.read;
        writeButton.onclick = app.write;
        startNotificationButton.onclick = app.startNotification;
        stopNotificationButton.onclick = app.stopNotification;
    },
    scanAndConnect: function() {
        app.log("Scanning");
        if (app.connectedPeripheral) {
            var success = function() {
                app.log("Disconnect before Scan success.");
            };
            var failure = function() {
                app.log("Disconnect before Scan failed.");
            };
            ble.disconnect(app.connectedPeripheral.id, success, failure);
        }

        ble.startScan([SERVICE], function(peripheral) {
            app.log("Found peripheral.");
            ble.stopScan(function() {
                // does iOS need this?
                app.log("Scan stopped. Connecting...");
                ble.connect(peripheral.id, app.onConnect, app.onDisconnect);
            }, app.onError);
        }, app.onError);
    },
    onConnect: function(device) {
        app.connectedPeripheral = device;
        app.log(JSON.stringify(device));
    },
    onDisconnect: function() {
        app.log("Disconnected");
    },
    read: function() {
        app.log("Read");
        ble.read(app.connectedPeripheral.id, SERVICE,
            READ_CHARACTERISTIC, app.onRead, app.onError);
    },
    onRead: function(buffer) {
        app.log("onRead");
        var data = new Uint32Array(buffer);
        counterValueFromRead.innerText = data[0];
    },
    write: function() {
        app.log("Write");
        var data = new Uint32Array(1);
        data[0] = counterInput.value;
        ble.write(app.connectedPeripheral.id,
            SERVICE, WRITE_CHARACTERISTIC, data.buffer,
            function() {
                app.log("Write Success");
            },
            app.onError);
    },
    startNotification: function() {
        app.log('startNotification');
        ble.startNotification(app.connectedPeripheral.id, SERVICE,
            NOTIFY_CHARACTERISTIC, app.onNotify, app.onError);
    },
    stopNotification: function() {
        app.log('startNotification');
        ble.stopNotification(app.connectedPeripheral.id, SERVICE,
            NOTIFY_CHARACTERISTIC, function() {
            app.log("Notifications Stopped");
        }, app.onError);
    },
    onNotify: function(buffer) {
        var data = new Uint32Array(buffer);
        counterValueFromNotification.innerText = data[0];
    },
    log: function(message) {
        console.log(message);
        messageDiv.innerText = message;
    },
    onError: function(error) {
        app.log(error);
        alert(error);
    }
};

app.initialize();
