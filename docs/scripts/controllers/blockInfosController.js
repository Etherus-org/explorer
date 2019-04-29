angular.module('ethExplorer')
    .controller('blockInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

        $scope.init=function()
        {


            $scope.blockId=$routeParams.blockId;


            if($scope.blockId!==undefined) {

                getBlockInfos()
                    .then(async function(result){
                        var number = await web3.eth.getBlockNumber();

                    $scope.result = result;

                    $scope.numberOfUncles = result.uncles.length;

                    //if ($scope.numberOfUncles!=0) {
                    //	uncle1=result.uncles[0];
                    //	console.log(web3.eth.getUncle(uncle1));
                    //}

                    if(result.hash!==undefined){
                        $scope.hash = result.hash;
                    }
                    else{
                        $scope.hash ='pending';
                    }
                    if(result.miner!==undefined){
                        $scope.miner = result.miner;
                    }
                    else{
                        $scope.miner ='pending';
                    }
                    $scope.gasLimit = result.gasLimit;
                    $scope.gasUsed = result.gasUsed;
                    $scope.nonce = result.nonce;
                    var diff = ("" + result.difficulty).replace(/['"]+/g, '') / 1000000000000;
                    $scope.difficulty = diff.toFixed(3) + " T";
                    $scope.gasLimit = result.gasLimit.toFixed(0) + " m/s"; // that's a string
                    $scope.gasUsed = result.gasUsed.toFixed(0) + " m/s";
                    $scope.nonce = result.nonce;
                    $scope.number = result.number;
                    $scope.parentHash = result.parentHash;
                    $scope.uncledata = result.sha3Uncles;
                    $scope.rootHash = result.stateRoot;
                    $scope.blockNumber = result.number;
                    $scope.timestamp = new Date(result.timestamp * 1000).toUTCString();
                    $scope.extraData = result.extraData.slice(2);
                    $scope.dataFromHex = hex2a(result.extraData.slice(2));
                    $scope.size = result.size;
                    $scope.firstBlock = false;
                    $scope.lastBlock = false;
                    if ($scope.blockNumber !== undefined){
                            $scope.conf = number - $scope.blockNumber + " Confirmations";
                            if (number === $scope.blockNumber){
                                $scope.conf = 'Unconfirmed';
                                $scope.lastBlock = true;
                            }
                            if ($scope.blockNumber === 0) {
                                $scope.firstBlock = true;
                            }
                        }

                        if ($scope.blockNumber !== undefined){
                            var info = await web3.eth.getBlock($scope.blockNumber);
                            if (info !== undefined){
                                var newDate = new Date();
                                newDate.setTime(info.timestamp * 1000);
                                $scope.time = newDate.toUTCString();
                            }
                        }
                    });

            } else {
                $location.path("/");
            }


            function getBlockInfos(){
                return web3.eth.getBlock($scope.blockId);

            }


        };
        $scope.init();

        // parse transactions
        $scope.transactions = []

        web3.eth.getBlockTransactionCount($scope.blockId).then((result, error) => {
            var txCount = result;
            $scope.numberOfTransactions = txCount;
            for (var blockIdx = 0; blockIdx < txCount; blockIdx++) {
                web3.eth.getTransactionFromBlock($scope.blockId, blockIdx).then((result, error) => {
	                // console.log("Result: ", result);
                    web3.eth.getTransactionReceipt(result.hash).then((receipt, error) => {
                        var transaction = {
                            id: receipt.transactionHash,
                            hash: receipt.transactionHash,
                            from: receipt.from,
                            to: receipt.to,
                            gas: receipt.gasUsed,
                            input: result.input.slice(2),
                            value: web3.utils.fromWei(result.value, "ether"),
                            contractAddress: receipt.contractAddress
                        }
                        $scope.$apply(
                            $scope.transactions.push(transaction)
                        );
                    });
                })
            }
        });

function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));

    return str;
}
});
