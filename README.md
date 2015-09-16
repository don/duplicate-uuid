Bluetooth LE Duplicate UUID

Cordova project to test Bluetooth LE services with Duplicate UUIDs causing bugs with https://github.com/don/cordova-plugin-ble-central[cordova-plugin-ble-central.

See [Issue 82](https://github.com/don/cordova-plugin-ble-central/issues/82) and [Pull Request 94](https://github.com/don/cordova-plugin-ble-central/pull/94).

== Run the Bluetooth Service

    $ cd bleno
    $ npm install
    $ node .

== Cordova

    $ cordova plugin install cordova-plugin-ble-central
    $ cordova platform add android
    $ cordova platform add ios
    $ cordova run
