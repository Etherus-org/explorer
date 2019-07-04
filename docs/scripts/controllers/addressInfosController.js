// preliminary code! TDD - still needs refactoring & optimization
//
//
// chainInfoController.js
//
// contains 1 controller:
//    addressInfosCtrl
//
// by AltSheets
//    September 2015
//

angular.module('ethExplorer')
    .controller('addressInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

        $scope.init=function()
        {

            $scope.addressId=$routeParams.addressId;
            var addressId = $routeParams.addressId;

            if($scope.addressId!==undefined) {
            	getAddressBalance()
                    .then(function(result){
                    	$scope.balance = +web3.utils.fromWei(result);
                        getETHUSD();
                    });
            	getAddressTransactionCount()
	                .then(function(result){
	                	$scope.txCount = result;
	                });
            	getCode()
            		.then(function(result){
            			$scope.code = result;
            		});
            	getTransactions()
                .then(function(result){
                	console.log("getTransactions is executed!")
                	console.log(result)
                	$scope.transactions=result;
                	});
            } else {
                $location.path("/");
            }

            function getAddressBalance(){
                var deferred = $q.defer();
                web3.eth.getBalance($scope.addressId)
                    .then(result => deferred.resolve(result))
                    .catch(error => deferred.resolve(error));
                return deferred.promise;
            }

            function getETHUSD() {

                $scope.balanceusd = "$" + (4*$scope.balance).toFixed(2);

/*              $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(json) {
                var price = Number(json[0].price_usd);
                var ethusd = price.toFixed(2);
                var balanceusd = "$" + ethusd * $scope.balance;
                $scope.balanceusd = balanceusd;
                //console.log("Balance in USD " + $scope.balanceusd);
              }); */
            }

            function getAddressTransactionCount(){
                return web3.eth.getTransactionCount($scope.addressId);
            }

            function getCode(){
                return web3.eth.getCode($scope.addressId);
            }

            $scope.currentTxPage = 1;
            $scope.totalTxPages = 1;
            $scope.txsPerPage = 10;
            $scope.totalTxs = 0;

            function getTransactions(){
                const ETHERUS_API = 'https://api.etherus.org/vl/';
                var deferred = $q.defer();
                fetch(ETHERUS_API + 'transactions?addr=' + $scope.addressId.replace(/^0x/, '')
                    + '&start=' + (($scope.currentTxPage-1)*$scope.txsPerPage) + '&num=' + $scope.txsPerPage)
                    .then(r => r.json()).then(j => {
                        $scope.totalTxPages = j.result.total / j.result.txsPerPage;
                        $scope.totalTxs = j.result.total;
                        deferred.resolve(j.result.txs);
                });
                return deferred.promise;
            }

            $scope.pageChanged = async function() {
                $scope.transactions = await getTransactions();
                $scope.$apply();
            }

        };
        $scope.init();

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
});
