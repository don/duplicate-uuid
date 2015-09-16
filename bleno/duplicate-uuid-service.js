// Create a Bluetooth LE Service with duplicate Characteristic UUIDs
// Used for testing Cordova BLE Central plugin issues
//

// "good" service
// var SERVICE_UUID = 'd000';
// var READ_CHARACTERISTIC_UUID = 'd001';
// var WRITE_CHARACTERISTIC_UUID = 'd002';
// var NOTIFY_CHARACTERISTIC_UUID = 'd003';

// "bad" service with duplicate uuids
var SERVICE_UUID = 'e000';
var READ_CHARACTERISTIC_UUID = 'e001';
var WRITE_CHARACTERISTIC_UUID = 'e001';
var NOTIFY_CHARACTERISTIC_UUID = 'e001';

var util = require('util');
var bleno = require('bleno');
var counter = 0;

var ReadCharacteristic = function() {
    ReadCharacteristic.super_.call(this, {
        uuid: READ_CHARACTERISTIC_UUID,
        properties: ['read']
    });
};
util.inherits(ReadCharacteristic, bleno.Characteristic);

ReadCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var result = this.RESULT_SUCCESS;
  var data = new Buffer(4);
  data.writeUInt32LE(counter, 0);

  callback(result, data);
};

var WriteCharacteristic = function() {
    WriteCharacteristic.super_.call(this, {
        uuid: WRITE_CHARACTERISTIC_UUID,
        properties: ['write']
    });
};
util.inherits(WriteCharacteristic, bleno.Characteristic);

WriteCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  console.log('WriteCharacteristic write request: ' + data.toString('hex') + ' ' + offset + ' ' + withoutResponse);
  counter = data.readUInt32LE();
  callback(this.RESULT_SUCCESS);
};

var NotifyCharacteristic = function() {
    NotifyCharacteristic.super_.call(this, {
        uuid: NOTIFY_CHARACTERISTIC_UUID,
        properties: ['notify']
    });
};
util.inherits(NotifyCharacteristic, bleno.Characteristic);

NotifyCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('NotifyCharacteristic subscribe');

  this.changeInterval = setInterval(function() {
    var data = new Buffer(4);
    data.writeUInt32LE(counter, 0);

    console.log('NotifyCharacteristic update value: ' + counter);
    updateValueCallback(data);
    counter++;
  }.bind(this), 5000);
};

NotifyCharacteristic.prototype.onUnsubscribe = function() {
  console.log('NotifyCharacteristic unsubscribe');

  if (this.changeInterval) {
    clearInterval(this.changeInterval);
    this.changeInterval = null;
  }
};

var readCharacteristic = new ReadCharacteristic();
var writeCharacteristic = new WriteCharacteristic();
var notifyCharacteristic = new NotifyCharacteristic();

var primaryService = new bleno.PrimaryService({
    uuid: SERVICE_UUID,
    characteristics: [
        readCharacteristic,
        writeCharacteristic,
        notifyCharacteristic
    ]
});

bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);

    if (state === 'poweredOn') {
        bleno.startAdvertising('Count', [primaryService.uuid]);
    } else {
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function(error) {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

    if (!error) {
        bleno.setServices([primaryService]);
    }
});
