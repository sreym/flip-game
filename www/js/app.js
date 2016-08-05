// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('GameCtrl', function($scope, $ionicModal) {
  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  var comp = new Uint8Array(1 << 16);
  comp[0] = 0;
  comp[1] = 1;
  comp[2] = 1;
  comp[3] = 1;

  function gencomp(n) {
    var fsize = (1 << n);
    var tof = 1 << fsize;
    var fhsize = (1 << (n - 1));
    var tof_pre = 1 << fhsize;
    var hmask = ((1 << fhsize) - 1);
    for (var f = tof_pre; f < tof; f++) {
      var f1 = f >> fhsize;
      var f2 = f & hmask;
      var c = comp[f1] + comp[f2];
      for (var f3 = 1; f3 < tof_pre; f3++) {
        c = Math.min(c, comp[f1 ^ f3] + comp[f2 ^ f3] + comp[f3]);
      }
      comp[f] = c;
    }
  }

  function getmincomp() {
    var n = 5;
    var f1 = ($scope.f[0] << 8) ^ ($scope.f[1]);
    var f2 = ($scope.f[2] << 8) ^ ($scope.f[3]);
    var fhsize = (1 << (n - 1));
    var tof_pre = 1 << fhsize;
    var c = comp[f1] + comp[f2];
    for (var f3 = 1; f3 < tof_pre; f3++) {
      c = Math.min(c, comp[f1 ^ f3] + comp[f2 ^ f3] + comp[f3]);
    }
    return c;
  }

  gencomp(2);
  gencomp(3);
  gencomp(4);

  function getcomp(f3) {
    var f1 = ($scope.f[0] << 8) ^ ($scope.f[1]);
    var f2 = ($scope.f[2] << 8) ^ ($scope.f[3]);
    return comp[f1 ^ f3] + comp[f2 ^ f3] + comp[f3];
  }
  var updatef3mods = function() {
    var f3 = $scope.f3.reduce(function(pv, cv) {
      return (pv << 1) ^ (cv ? 1 : 0)
    }, 0);
    $scope.comp = getcomp(f3);
    for (var i = 0; i < $scope.f3_mods.length; i++) {
      $scope.f3_mods[i] = getcomp(f3 ^ (1 << ($scope.f3_mods.length - i - 1))) + '';
    }
  }

  var zero4 = function(val) {
    var s = '';
    while (s.length + val.length < 4) s += '0';
    return s + val;
  }

  $scope.fpart = function(n) {
    var fp = $scope.f[n / 2 | 0];
    if ((n & 1) === 0) {
      return zero4((fp & 0xF).toString(2));
    } else {
      return zero4(((fp >> 4) & 0xF).toString(2));
    }
  }

  $scope.switch = function(i) {
    $scope.f3[i] = !$scope.f3[i];
    updatef3mods();
    $scope.clicks++;

    if ($scope.comp == $scope.mincomp) {
      $scope.modal.show();
    }
  }

  $scope.newgame = function() {
    $scope.f = new Uint16Array(4);
    for (var i = 0; i < $scope.f.length; i++) {
      $scope.f[i] = Math.random() * Math.pow(2, 8) | 0;
    }
    $scope.f3 = new Array(16);
    $scope.f3_mods = new Array(16);
    $scope.comp = 0;
    $scope.mincomp = getmincomp();
    $scope.clicks = 0;

    for (var i = 0; i < $scope.f3.length; i++) {
      $scope.f3[i] = false;
    }
    updatef3mods();

    if ($scope.comp == $scope.mincomp) {
      setTimeout(function() {
        $scope.modal.show();
      }, 1000);
    }
  }


  $scope.newgame();
})

.controller('ResultCtrl', function($scope) {
  $scope.close = function() {
    $scope.modal.hide();
    $scope.newgame();
  }
});