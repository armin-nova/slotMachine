// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external payable returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract VIPCasinoToken is IERC20 {
    string public constant name = "VIPCasinoToken";
    string public constant symbol = "VIPCT";
    uint8 public constant decimals = 18;

    event Approval(
        address indexed tokenOwner,
        address indexed spender,
        uint256 tokens
    );
    event Transfer(address indexed from, address indexed to, uint256 tokens);

    mapping(address => uint256) balances;

    mapping(address => mapping(address => uint256)) allowed;

    uint256 totalSupply_ = 100000000 ether;

    using SafeMath for uint256;

    constructor() public {
        balances[msg.sender] = totalSupply_;
    }

    function totalSupply() public view override returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner)
        public
        view
        override
        returns (uint256)
    {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens)
        public
        override
        returns (bool)
    {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(numTokens);
        balances[receiver] = balances[receiver].add(numTokens);
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens)
        public
        override
        returns (bool)
    {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate)
        public
        view
        override
        returns (uint256)
    {
        return allowed[owner][delegate];
    }

    function transferFrom(
        address owner,
        address buyer,
        uint256 numTokens
    ) public payable override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner].sub(numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        emit Transfer(owner, buyer, numTokens);
        return true;
    }
}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract DEX {
    event Bought(uint256 amount);
    event Sold(uint256 amount);

    IERC20 public token;

    constructor() public {
        token = new VIPCasinoToken();
    }
    
    // event ReturnSpinResult(uint256[] indexed result, string indexed resultMessage );
    event ReturnSpinResult(uint256[] result1, string text);

    function buy() public payable {
        uint256 amountTobuy = msg.value;
        uint256 dexBalance = token.balanceOf(address(this));
        require(amountTobuy > 0, "You need to send some Ether");
        require(amountTobuy <= dexBalance, "Not enough tokens in the reserve");
        token.transfer(msg.sender, amountTobuy);
        emit Bought(amountTobuy);
    }

    function getAllowance() public view returns (uint256) {
        return token.allowance(msg.sender, address(this));
    }

    function getBalanceOfSender() public view returns (uint256) {
        return token.balanceOf(msg.sender);
    }

    function BANK() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    function test() public payable returns (uint256, uint256)
    {
        uint256 dexBalance = token.balanceOf(msg.sender);

        uint256 bankBalance = token.balanceOf(address(this));
        
        token.allowance(msg.sender, address(this));
        token.transferFrom(msg.sender, address(this), 1);
        
        return (dexBalance, bankBalance);
    }

    function spinSlotMachine(uint256 pictureCount) public payable returns (uint256[] memory, string memory)
    {
        uint256 dexBalance = token.balanceOf(msg.sender);

        uint256 oneToken = 1 wei;
        
        require(dexBalance >=  oneToken, "You need to more VIP Casino Tokens to spin");
        token.transferFrom(msg.sender, address(this), oneToken);
        

        uint256[] memory x = new uint256[](3);
        if (pictureCount == 0){
            ReturnSpinResult(x, "No pictureCount");
            return (x, "Null");  
        } 
        x[0] = random(pictureCount, 0);
        x[1] = random(pictureCount, 4);
        x[2] = random(pictureCount, 2);

        if (
            (x[0] != x[1] && x[0] == x[2]) ||
            (x[0] != x[2] && x[0] == x[1]) ||
            (x[0] != x[1] && x[1] == x[2])
        ) {
            // send money with factor 2x
            uint256 double = oneToken * 2;
            token.transfer(msg.sender, double);
            ReturnSpinResult(x, "Multiple 2x");
            return (x, "Multiple 2");
        }

        if (x[0] == x[1] && x[0] == x[2]) {
            uint256 double = oneToken * 6;
            token.transfer(msg.sender, double);
            ReturnSpinResult(x, "Multiple 6x");
            return (x, "Multiple 6");
        }

        ReturnSpinResult(x, "No Win!");
        return (x, "No win!");
    }

    function random(uint256 pictureCount, uint256 nounce)
        internal
        view
        returns (uint256)
    {
        uint256 nonce = nounce;
        uint256 randomnumber;
        randomnumber =
            uint256(keccak256(abi.encodePacked(now, msg.sender, nonce))) %
            pictureCount;
        nonce++;
        return randomnumber;
    }

    function sell(uint256 amount) public {
        require(amount > 0, "You need to sell at least some tokens");
        token.approve(address(this), amount);
        token.approve(msg.sender, amount);
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        token.transferFrom(msg.sender, address(this), amount);
        // token.transfer(address(this), amount);
        // address(this).transfer(amount);
        msg.sender.transfer(amount);
        emit Sold(amount);
    }
}
