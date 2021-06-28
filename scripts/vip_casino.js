function SlotMachine(id, useroptions) {
	var that = this; //keep reference to function for use in callbacks
	//set some variables from the options, or with defaults.
	var options = useroptions ? useroptions : {};
	this.reelCount = options.reelCount ? options.reelCount : 3; //how many reels, assume 3 
	this.symbols = options.symbols ? options.symbols : ['A', 'B', 'C'];
	this.sameSymbolsEachSlot = true;
	this.startingSet = options.startingSet;
	this.winningSet = options.winningSet;
	this.width = options.width ? options.width : 100;
	this.height = options.width ? options.height : 100;
	this.time = options.time ? (options.time * 1000) : 6500; //time in millis for a spin to take	
	this.howManySymbolsToAppend = Math.round(this.time / 325); //how many symbols each spin adds
	this.endingLocation = 7; //location for selected symbol... needs to be a few smaller than howManySymbolsToAppend
	this.jqo = $("#" + id); //jquery object reference to main wrapper
	this.jqoSliders = []; //jquery object reference to strips sliding up and down
	this.callback = options.callback; //callback function to be called once slots animation is finished

	//to initialize we construct the correct number of slot windows
	//and then populate each strip once
	this.init = function () {
		this.jqo.addClass("slot-machine"); //to get the css goodness
		//figure out if we are using the same of symbols for each window - assume if the first 
		//entry of the symbols is not a string we have an array of arrays
		if (typeof this.symbols[0] != 'string') {
			this.sameSymbolsEachSlot = false;
		}
		//make each slot window
		for (var i = 0; i < this.reelCount; i++) {
			var jqoSlider = $('<div class="slider"></div>');
			var jqoWindow = $('<div class="window window_"' + i + '></div>');
			this.scaleJqo(jqoWindow).append(jqoSlider); //make window right size and put slider in it
			this.jqo.append(jqoWindow); //add window to main div
			this.jqoSliders.push(jqoSlider); //keep reference to jqo of slider
			this.addSymbolsToStrip(jqoSlider, i, false, true); //and add the initial set 
		}
	};
	//convenience function since we need to apply width and height to multiple parts
	this.scaleJqo = function (jqo) {
		jqo.css("height", this.height + "px").css("width", this.width + "px");
		return jqo;
	}
	//add the various symbols - but take care to possibly add the "winner" as the symbol chosen
	this.addSymbolsToStrip = function (jqoSlider, whichReel, shouldWin, isInitialCall, winningSet) {
		var symbolsToUse = that.sameSymbolsEachSlot ? that.symbols : that.symbols[whichReel];
		var chosen = shouldWin ? winningSet[whichReel] : Math.floor(Math.random() * symbolsToUse.length);
		for (var i = 0; i < that.howManySymbolsToAppend; i++) {
			var ctr = (i == that.endingLocation) ? chosen : Math.floor(Math.random() * symbolsToUse.length);
			if (i == 0 && isInitialCall && that.startingSet) {
				ctr = that.startingSet[whichReel];
			}
			//we nest "content" inside of "symbol" so we can do vertical and horizontal centering more easily
			var jqoContent = $("<div class='content'>" + symbolsToUse[ctr] + "</div>");
			that.scaleJqo(jqoContent);
			var jqoSymbol = $("<div class='symbol'></div>");
			that.scaleJqo(jqoSymbol);
			jqoSymbol.append(jqoContent);
			jqoSlider.append(jqoSymbol);
		}
		return chosen;
	}
	//to spin, we add symbols to a strip, and then bounce it down
	this.spinOne = function (jqoSlider, whichReel, shouldWin, winningSet) {
		var heightBefore = parseInt(jqoSlider.css("height"), 10);
		var chosen = that.addSymbolsToStrip(jqoSlider, whichReel, shouldWin, null, winningSet);
		var marginTop = -(heightBefore + ((that.endingLocation) * that.height));
		jqoSlider.stop(true, true).animate(
			{ "margin-top": marginTop + "px" },
			{ 'duration': that.time + Math.round(Math.random() * 1000), 'easing': "easeOutElastic" });
		return chosen;
	}
	

	this.spinAll = function (shouldWin, winningSet) {
		var results = [];
		for (var i = 0; i < that.reelCount; i++) {
			results.push(that.spinOne(that.jqoSliders[i], i, shouldWin, winningSet));
		}

		if (that.callback) {
			setTimeout(function () {
				that.callback(results);
			}, that.time);
		}

		return results;
	}

	this.init();
	return {
		spin: function (winningSet) {
			return that.spinAll(true, winningSet);
		},
		win: function () {
			return that.spinAll(true);
		}
	}
}

// module.exports.SlotMachine = SlotMachine; 



const ethereumButton = document.querySelector(".enableEthereumButton");
const sendNumberButton = document.querySelector(".sendNumberButton");
const balanceTag = document.querySelector(".showBalance");
const resultButton = document.querySelector(".getResult");
const retrieveNumberButton = document.querySelector(".retrieveNumberButton");
const storeButton = document.querySelector("#storeButton");
const showAccount = document.querySelector(".showAccount");
const showNumber = document.querySelector(".showNumber");
const loadingMessage = document.querySelector("#loading-message");


var address = "0xEd37ea5d277237987b0D1a79b5D44D016aFA7eB2";
var abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Bought",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "buy",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "result1",
				"type": "uint256[]"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "text",
				"type": "string"
			}
		],
		"name": "ReturnSpinResult",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "sell",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Sold",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "pictureCount",
				"type": "uint256"
			}
		],
		"name": "spinSlotMachine",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "test",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "BANK",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalanceOfSender",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function loadWeb3() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
  }
}

async function load() {
  await loadWeb3();
  updateStatus("Web3 is ready!");
}

function updateStatus(status) {
  /*const statusEl = document.querySelector(".showStatus");
    statusEl.innerHTML = status;*/
  console.log(status);
}

load();
var VIPCasinoToken = new web3.eth.Contract(abi, address);

ethereumButton.addEventListener("click", () => {
  getAccount();
  updateBalance();
  //window.ethereum.enable();
});

async function getAccount() {
  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = accounts[0];
  showAccount.innerHTML = account;
}

// retrieveNumberButton.addEventListener("click", () => {
//     retrieveNumber();
// });

async function retrieveNumber() {
  var number = await Storage.methods.retrieve().call();
  showNumber.innerHTML = number;
}
async function getCurrentAccount() {
  const accounts = await window.web3.eth.getAccounts();
  return accounts[0];
}

document.getElementById("number").addEventListener("keyup", function(event) {});

sendNumberButton.addEventListener("click", () => {
  buyCoins();
});

async function buyCoins() {
  const value = parseInt(document.getElementById("number").value);
  console.log(value);
  const account = await getCurrentAccount();
  await VIPCasinoToken.methods
    .buy()
    .send({ from: account, value: value })
    .then(() => {
      document.getElementById("number").value = "";
      updateBalance();
    })
    .catch((err) => {
      console.log("error: ", err);
    });
}
async function updateBalance() {
  var balance = await VIPCasinoToken.methods.getBalanceOfSender().call();
  console.log("Balance of the user:", balance);
  balanceTag.innerHTML = balance.toString();
}
async function spinSlotMachine() {
	loadingMessage.innerHTML = "Waiting for transaction to finish...";
	resultButton.disabled = true;
	await VIPCasinoToken.events
		.ReturnSpinResult()
		.on("data", (event) => {
		// console.log("Event data: ", event);
		if(event){
			
			var winningSet = event.returnValues[0];
			var winningSetInt = [];
			console.log("winningSet davor: ", winningSet);
			winningSetInt.push(parseInt(winningSet[0]));
			winningSetInt.push(parseInt(winningSet[1]));
			winningSetInt.push(parseInt(winningSet[2]));
				
			console.log("winningSet danach: ", winningSetInt);
			loadingMessage.innerHTML = "...Finished transaction";

			//all parameters except id are optional
			slotMachine.spin(winningSetInt);
			resultButton.disabled = false;
			// $("#spin-button").click(function () {
			// console.log();
			// });
		}
		})
		.on("error", console.error);

  const account = await getCurrentAccount();
  await VIPCasinoToken.methods
    .spinSlotMachine(7)
    .send({ from: account, gas: 5000000 })
    .then((res) => {
      console.log("res: ", res);
    })
    .catch((err) => {
      console.log("err: ", err);
	  loadingMessage.innerHTML = "";
	  resultButton.disabled = false;
    });
  // showNumber.innerHTML = result;

}

resultButton.addEventListener("click", () => {
  spinSlotMachine();
});

// var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
		var images = ['<img src="images/crying_laughing.png">', '<img src="images/diamond.png">', '<img src="images/heart.png">', '<img src="images/heart.png">', '<img src="images/poo.png">', '<img src="images/sunglasses.png">', '<img src="images/monkey.png">'];
			// var misc = ["!", "K", "*", "#", "@", "$"];
			// var callbackFunction = function (result) {
			// alert(JSON.stringify(result));
			// };
var slotMachine = new SlotMachine("slot-machine", { reelCount: 3, winningSet: [0, 0, 0], symbols: images, height: 126, width: 126 });


// module.exports = {
// 	buyCoins: buyCoins(),
// };
