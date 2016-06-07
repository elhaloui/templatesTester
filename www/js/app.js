
// CG MKB


angular.module('docLock', ['ionic', 'ngCordova'])
.run(function () {
	ionic.Platform.ready(function () {
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
		});
})
.config(function ($stateProvider, $urlRouterProvider) {
	console.log('debut config');
	$stateProvider
	.state('login', {
		url : '/login',
		templateUrl : '/templates/login.html',
	})
	.state('pass', {
		url : '/pass',
		templateUrl : '/templates/pass.html',
	})
	.state('main', {
		url : '/main',
		templateUrl : '/templates/main.html',
	});
	if (window.localStorage.localSettings && JSON.parse(window.localStorage.localSettings).appPass) {
		$urlRouterProvider.otherwise('/login');
	} else {
		$urlRouterProvider.otherwise('/pass');
		console.log('here') ;
	}
})
.controller('mkbNavCtrl', function ($scope, $state,$ionicSideMenuDelegate, $ionicLoading, $ionicPopup, $ionicModal, $cordovaSQLite, $interval) {

	$scope.pwdList = JSON.parse(localStorage.getItem("pwdList"));
	$scope.tmp = { currPassword : "" };
	$scope.enableSettings = false;
	$scope.userAuth = false;
	$scope.sigFill = Array.apply(null, Array(198)).map(String.prototype.valueOf, 'C6');
	$scope.platformAndroid = ionic.Platform.isAndroid();
	
	var localSettings = JSON.parse(localStorage.getItem("localSettings"));
	var secret = localStorage.getItem("secret");
	if (!localSettings) {
		var settings = {
			appPass : false
		};
		localStorage.setItem("localSettings", JSON.stringify(settings));
		localSettings = JSON.parse(localStorage.getItem("localSettings"));
		console.log("Setting Local:" + localSettings);
	}

	$scope.formPass = {
		pass1 : "",
		pass2 : "",
		oldPass : ""
	};

	$scope.appPassword = "";
	$scope.appPassword_confirm = "";
	$scope.passFound = localSettings.appPass;
	console.log("PassFound:" + $scope.passFound);

	$scope.savePass = function () {
		
		if ($scope.passFound) {
			if ($scope.formPass.oldPass == "") {
				$ionicLoading.show({
					template : "Provide Old password!",
					noBackdrop : true,
					duration : 1000
				});
				return;
			} else {
				if (!$scope.passVerify($scope.formPass.oldPass)) {
					$ionicLoading.show({
						template : "Old password mismatch!",
						noBackdrop : true,
						duration : 1000
					});
					return;
				} 
			}
		}
		if ($scope.formPass.pass1 == "" || $scope.formPass.pass2 == "") {
			$ionicLoading.show({
				template : "Blank passwords!",
				noBackdrop : true,
				duration : 1000
			});
			return;
		}
		if ($scope.formPass.pass1 != $scope.formPass.pass2) {
			$ionicLoading.show({
				template : "Password and Confirm-Password mismatch!",
				noBackdrop : true,
				duration : 1000
			});
			return;
		}

		localStorage.setItem("secret", CryptoJS.AES.encrypt("646576616775687961", $scope.formPass.pass1));
		$scope.passFound = true;
		$scope.storeSettings();

		
	};

	$scope.storeSettings = function () {
		var settings = {
			appPass : $scope.passFound
		};
		localStorage.setItem("localSettings", JSON.stringify(settings));
	};


	$scope.showMenu = function () {
		$ionicSideMenuDelegate.toggleLeft();
	};
	$scope.passVerify = function (currPassword) {
		try {
			var decodedText = CryptoJS.AES.decrypt(localStorage.getItem("secret"), currPassword).toString(CryptoJS.enc.Utf8);
		} catch (e) {
			$ionicLoading.show({
				template : "Unable to verify password!",
				noBackdrop : true,
				duration : 2000
			});
			return false;
		}
		if (decodedText == "646576616775687961")
			return true;
			 else
				return false;
	};

	$scope.passSubmit = function (currPassword) {
		if ($scope.passVerify(currPassword)) {
			$scope.appPassword = currPassword;
			$scope.currPassword = $scope.sigFill;
			$ionicLoading.show({
				template : "Password Match!",
				noBackdrop : true,
				duration : 1000
			});
			$scope.enableSettings = true;
			$scope.userAuth = true;
			
			$state.go('main', {}, {
				reload : true
			});
			console.log("Password Match");
		} else {
			$scope.enableSettings = false;
			$ionicLoading.show({
				template : "Password Mismatch!",
				noBackdrop : true,
				duration : 1000
			});
			console.log(currPassword);
			return;
		}
	};
	$scope.cancelModalPass=function(){
		$scope.modalPass.hide()
		$state.go('main', {}, {
				reload : true
			});
		console.log('go to main');
	};
   
   $ionicModal.fromTemplateUrl('templates/pass.html', {
		scope : $scope,
		animation : 'slide-in-up'
	}).then(function (modal) {
		$scope.modalPass = modal;
	});

	$scope.setPass = function () {
		$scope.modalPass.show();
	}

	$scope.cancelModal = function () {
		$scope.modalPass.hide();
	}

    $scope.logout = function (withGracePeriod) {
		if (!$scope.userAuth)
			return;
		if (!withGracePeriod) {
			$scope.enableSettings = false;
			$scope.userAuth = false;
			$scope.appPassword = $scope.sigFill;
			if ($scope.platformAndroid)
				navigator.app.exitApp(); //window.location = 'index.html'; 	//
		} else {
			
			$ionicLoading.show({
				template : "Exiting in 10 Sec...",
				noBackdrop : true,
				duration : 3000
			});
			
		}
	};

	

	$scope.hex2a = function (hexx) {
		var hex = hexx.toString(); //force conversion
		var str = '';
		for (var i = 0; i < hex.length; i += 2)
			str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
		return str;
	};

});




// End