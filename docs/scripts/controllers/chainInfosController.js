angular.module('ethExplorer')
    .controller('chainInfosCtrl', function ($rootScope, $scope, $location, $routeParams, $q) {

        $scope.init=function()
        {
            getChainInfos()
                .then(async function(result){

	                $scope.result = result;  // just a dummy value, but following Whit's example.

	                $scope.blockNum = await web3.eth.getBlockNumber(); // now that was easy

	                if($scope.blockNum!==undefined){

	                	// TODO: put the 2 web3.eth.getBlock into the async function below
	                	//       easiest to first do with fastInfosCtrl
	                    var blockNewest = await web3.eth.getBlock($scope.blockNum);

	                    if(blockNewest!==undefined){

		                    // difficulty
		                    $scope.difficulty = blockNewest.difficulty;
		                    $scope.difficultyToExponential = blockNewest.difficulty;

		                    $scope.totalDifficulty = blockNewest.totalDifficulty;
		                    $scope.totalDifficultyToExponential = blockNewest.totalDifficulty;

		                    $scope.totalDifficultyDividedByDifficulty = $scope.totalDifficulty/$scope.difficulty;
		                    $scope.totalDifficultyDividedByDifficulty_formatted = $scope.totalDifficultyDividedByDifficulty.toFixed(1);

		                    $scope.AltsheetsCoefficient = $scope.totalDifficultyDividedByDifficulty/$scope.blockNum;
		                    $scope.AltsheetsCoefficient_formatted = $scope.AltsheetsCoefficient.toFixed(4);

		                    // large numbers still printed nicely:
		                    $scope.difficulty_formatted = $scope.difficulty;
		                    $scope.totalDifficulty_formatted = $scope.totalDifficulty;

		                    // Gas Limit
		                    $scope.gasLimit = blockNewest.gasLimit.toFixed(0) + " m/s";

		                    // Time
	                        var newDate = new Date();
	                        newDate.setTime(blockNewest.timestamp*1000);
	                        $scope.time = newDate.toUTCString();

	                        $scope.secondsSinceBlock1 = blockNewest.timestamp - 1438226773;
	                        $scope.daysSinceBlock1 = ($scope.secondsSinceBlock1 / 86400).toFixed(2);

	                        // Average Block Times:
	                        // TODO: make fully async, put below into 'fastInfosCtrl'

	                        var blockBefore = await web3.eth.getBlock($scope.blockNum - 1);
	                        if(blockBefore!==undefined){
			                    $scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
	                        }
	                        $scope.range1=100;
	                        range = $scope.range1;
	                        var blockPast = await web3.eth.getBlock(Math.max($scope.blockNum - range,0));
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage1 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }
	                        $scope.range2=1000;
	                        range = $scope.range2;
	                        var blockPast = await web3.eth.getBlock(Math.max($scope.blockNum - range,0));
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage2 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }
	                        $scope.range3=10000;
	                        range = $scope.range3;
	                        var blockPast = await web3.eth.getBlock(Math.max($scope.blockNum - range,0));
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage3 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }
	                        $scope.range4=100000;
	                        range = $scope.range4;
	                        var blockPast = await web3.eth.getBlock(Math.max($scope.blockNum - range,0));
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage4 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }

	                        range = $scope.blockNum;
	                        var blockPast = await web3.eth.getBlock(1);
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverageAll = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }


	                        //fastAnswers($scope);
	                        //$scope=BlockExplorerConstants($scope);

	                    }
	                }

	                // Block Explorer Info

	                $scope.isConnected = await web3.eth.net.isListening();
	                //$scope.peerCount = web3.net.peerCount;
	                $scope.versionApi = web3.version;
	                $scope.versionClient = await web3.eth.getNodeInfo();
	                //$scope.versionNetwork = await web3.eth.getChainID();
	                $scope.versionCurrency = "Etherus"; // TODO: change that to currencyname?

	                // ready for the future:
	                try { $scope.versionWhisper = await web3.shh.getVersion(); }
	                catch(err) {$scope.versionWhisper = err.message; }

	                $scope.$apply();

                });

            function getChainInfos(){
                var deferred = $q.defer();
                deferred.resolve(0); // dummy value 0, for now. // see blockInfosController.js
                return deferred.promise;
            }
        };
        $scope.init();
        console.log($scope.result);

});
