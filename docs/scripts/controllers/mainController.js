const ETHERUS_API = 'https://api.etherus.org/vl/';
let mainCtrlTimerId = null;
let filter = null;

angular.module('ethExplorer')
    .controller('mainCtrl', function ($rootScope, $scope, $location) {

        console.log($rootScope.$$phase);
        initScope();

        if($rootScope.$$phase !== '$digest' || mainCtrlTimerId)
            return;

        console.log("Setting update timeout");

        mainCtrlTimerId = setTimeout(async () => {

            console.log("Updating...");

            async function loadInfo(){
                return await Promise.all([
                    getETHRates(),
                    updateBlockList(),
                    updateTXList(),
                    updateStats(),
                    getHashrate(),
                ]);
            }

            if(filter)
                filter.unsubscribe();

            console.log("Setting filter");
            filter = web3.eth.subscribe("newBlockHeaders", function (error, result) {
                console.log("Filtered " + result);
                if (!error) {
                    setTimeout(async () => {
                        await loadInfo();
                        $scope.$apply();
                    }, 3000);
                }
            });

            async function updateStats() {
                $scope.blockNum = await web3.eth.getBlockNumber(); // now that was easy

                if ($scope.blockNum !== undefined) {

                    // TODO: put the 2 web3.eth.getBlock into the async function below
                    //       easiest to first do with fastInfosCtrl
                    var blockNewest = await web3.eth.getBlock($scope.blockNum);

                    if (blockNewest !== undefined) {

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
                        newDate.setTime(blockNewest.timestamp * 1000);
                        $scope.time = newDate.toUTCString();

                        $scope.secondsSinceBlock1 = blockNewest.timestamp - 1438226773;
                        $scope.daysSinceBlock1 = ($scope.secondsSinceBlock1 / 86400).toFixed(2);

                        // Average Block Times:
                        // TODO: make fully async, put below into 'fastInfosCtrl'

                        var blockBefore = await web3.eth.getBlock($scope.blockNum - 1);
                        if (blockBefore !== undefined) {
                            $scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
                        }
                        /*
                        $scope.range1 = 100;
                        range = $scope.range1;
                        var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                        if (blockBefore !== undefined) {
                            $scope.blocktimeAverage1 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                        }
                        $scope.range2 = 1000;
                        range = $scope.range2;
                        var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                        if (blockBefore !== undefined) {
                            $scope.blocktimeAverage2 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                        }
                        $scope.range3 = 10000;
                        range = $scope.range3;
                        var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                        if (blockBefore !== undefined) {
                            $scope.blocktimeAverage3 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                        }
                        $scope.range4 = 100000;
                        range = $scope.range4;
                        var blockPast = web3.eth.getBlock(Math.max($scope.blockNum - range, 0));
                        if (blockBefore !== undefined) {
                            $scope.blocktimeAverage4 = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                        }

                        range = $scope.blockNum;
                        var blockPast = web3.eth.getBlock(1);
                        if (blockBefore !== undefined) {
                            $scope.blocktimeAverageAll = ((blockNewest.timestamp - blockPast.timestamp) / range).toFixed(2);
                        }
                        */
                        //fastAnswers($scope);
                        //$scope=BlockExplorerConstants($scope);

                    }
                }

            }


            function getHashrate() {
                $scope.hashrate = 'PoS';
                /*          $.getJSON("https://etherchain.org/api/miningEstimator", function(json) {
                            var hr = json.data[0].hashRate;
                            $scope.hashrate = hr;
                           }); */
            }

            function getETHRates() {
                $scope.ethprice = "$4.00";
                /*          $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(json) {
                            var price = Number(json[0].price_usd);
                            $scope.ethprice = "$" + price.toFixed(2);
                          }); */

                /*          $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(json) {
                            var btcprice = Number(json[0].price_btc);
                            $scope.ethbtcprice = btcprice;
                          });

                          $.getJSON("https://api.coinmarketcap.com/v1/ticker/ethereum/", function(json) {
                            var cap = Number(json[0].market_cap_usd);
                            //console.log("Current ETH Market Cap: " + cap);
                            $scope.ethmarketcap = cap;
                          }); */
            }

            async function updateTXList() {
                var currentTXnumber = await web3.eth.getBlockNumber();
                $scope.txNumber = currentTXnumber;
                $scope.recenttransactions = [];
                return fetch(ETHERUS_API + 'recent_transactions').then(response => response.json())
                    .then(json => $scope.recenttransactions = json.result);
            }

            async function updateBlockList() {
                var currentBlockNumber = await web3.eth.getBlockNumber();
                $scope.blockNumber = currentBlockNumber;
                $scope.blocks = [];
                return fetch(ETHERUS_API + 'recent_blocks').then(response => response.json())
                    .then(json => $scope.blocks = json.result);
            }

            // Display & update block list
            await loadInfo();
            $scope.$apply();
            mainCtrlTimerId = null;

        }, 300);

        function goToBlockInfos(requestStr) {
            $location.path('/block/' + requestStr);
        }

        function goToAddrInfos(requestStr) {
            $location.path('/address/' + requestStr.toLowerCase());
        }

        function goToTxInfos(requestStr) {
            $location.path('/tx/' + requestStr);
        }

        async function initScope(){
            $scope.processRequest = function () {
                var requestStr = $scope.ethRequest;


                if (requestStr !== undefined) {

                    // maybe we can create a service to do the reg ex test, so we can use it in every controller ?

                    var regexpTx = /[0-9a-zA-Z]{64}?/;
                    //var regexpAddr =  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/; // TODO ADDR REGEX or use isAddress(hexString) API ?
                    var regexpAddr = /^(0x)?[0-9a-f]{40}$/; //New ETH Regular Expression for Addresses
                    var regexpBlock = /[0-9]{1,7}?/;

                    var result = regexpTx.test(requestStr);
                    if (result === true) {
                        goToTxInfos(requestStr)
                    }
                    else {
                        result = regexpAddr.test(requestStr.toLowerCase());
                        if (result === true) {
                            goToAddrInfos(requestStr.toLowerCase())
                        }
                        else {
                            result = regexpBlock.test(requestStr);
                            if (result === true) {
                                goToBlockInfos(requestStr)
                            }
                            else {
                                console.log("nope");
                                return null;
                            }
                        }
                    }
                }
                else {
                    return null;
                }
            };

            // Block Explorer Info
            $scope.isConnected = await web3.eth.net.isListening();
            //$scope.peerCount = web3.net.peerCount;
            $scope.versionApi = web3.version;
            $scope.versionClient = web3.eth.getNodeInfo();
            //$scope.versionNetwork = web3.version.network;
            $scope.versionCurrency = "Etherus"; // TODO: change that to currencyname?

            // ready for the future:
            try {
                $scope.versionWhisper = await web3.shh.getVersion();
            }
            catch (err) {
                $scope.versionWhisper = err.message;
            }
        }

    });

angular.module('filters', []).filter('truncate', function () {
    return function (text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text.length <= length || text.length - end.length <= length) {
            return text;
        } else {
            return String(text).substring(0, length - end.length) + end;
        }
    };
}).filter('diffFormat', function () {
    return function (diffi) {
        if (isNaN(diffi)) return diffi;
        var n = diffi / 1000000000000;
        return n.toFixed(3) + " T";
    };
}).filter('stylize', function () {
    return function (style) {
        if (isNaN(style)) return style;
        var si = '<span class="btn btn-primary">' + style + '</span>';
        return si;
    };
}).filter('stylize2', function () {
    return function (text) {
        if (isNaN(text)) return text;
        var si = '<i class="fa fa-exchange"></i> ' + text;
        return si;
    };
}).filter('hashFormat', function () {
    return function (hashr) {
        if (isNaN(hashr)) return hashr;
        var n = hashr / 1000000000000;
        return n.toFixed(3) + " TH/s";
    };
}).filter('gasFormat', function () {
    return function (txt) {
        if (isNaN(txt)) return txt;
        var b = txt;
        return b.toFixed(0) + " m/s";
    };
}).filter('BigNum', function () {
    return function (txt) {
        if (isNaN(txt)) return txt;
        var b = txt;
        var w = web3.utils.fromWei(b.toString(), "ether");
        return (+w).toFixed(6) + " ETR";
    };
}).filter('sizeFormat', function () {
    return function (size) {
        if (isNaN(size)) return size;
        var s = size / 1000;
        return s.toFixed(3) + " kB";
    };
});
