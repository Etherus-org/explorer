angular.module('ethExplorer')
    .controller('transactionInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

        $scope.init=function()
        {


            $scope.txId=$routeParams.transactionId;




            if($scope.txId!==undefined) { // add a test to check if it match tx paterns to avoid useless API call, clients are not obliged to come from the search form...

                getTransactionInfos()
                    .then(async function (result) {
                        var number = await web3.eth.getBlockNumber();

                        $scope.result = result;

                        if (result.blockHash !== undefined) {
                            $scope.blockHash = result.blockHash;
                        }
                        else {
                            $scope.blockHash = 'pending';
                        }
                        if (result.blockNumber !== undefined) {
                            $scope.blockNumber = result.blockNumber;
                        }
                        else {
                            $scope.blockNumber = 'pending';
                        }
                        $scope.from = result.from;
                        $scope.gas = result.gas;
                        //$scope.gasPrice = result.gasPrice.c[0] + " WEI";
                        $scope.gasPrice = (+web3.utils.fromWei(result.gasPrice, "ether")).toFixed(10) + " ETR";
                        $scope.hash = result.hash;
                        $scope.input = result.input; // that's a string
                        $scope.nonce = result.nonce;
                        $scope.to = result.to;
                        $scope.transactionIndex = result.transactionIndex;
                        $scope.ethValue = web3.utils.fromWei(result.value, "ether");
                        $scope.txprice = web3.utils.fromWei((result.gas * result.gasPrice).toString(), "ether") + " ETR";
                        if ($scope.blockNumber !== undefined) {
                            $scope.conf = number - $scope.blockNumber;
                            if ($scope.conf === 0) {
                                $scope.conf = 'unconfirmed'; //TODO change color button when unconfirmed... ng-if or ng-class
                            }
                        }
                        //TODO Refactor this logic, asynchron calls + services....
                        if ($scope.blockNumber !== undefined) {
                            var info = await web3.eth.getBlock($scope.blockNumber);
                            if (info !== undefined) {
                                $scope.time = info.timestamp;
                            }
                        }

                        $scope.$apply();

                    });

            }



            else{
                $location.path("/"); // add a trigger to display an error message so user knows he messed up with the TX number
            }


            function getTransactionInfos(){
                let deferred = $q.defer();
                web3.eth.getTransaction($scope.txId)
                    .then(result => deferred.resolve(result))
                    .catch(error => deferred.resolve(error));
                return deferred.promise;
            }



        };
        $scope.init();
        console.log($scope.result);

    });
