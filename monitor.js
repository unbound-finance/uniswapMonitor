const ethers = require('ethers');
const Web3 = require("web3");

const uniPoolABI = require("./ABIS/uniPool.js");
const poolList = require("./config.js");

const ETHUSDCPool = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc";

let provider = ethers.getDefaultProvider("wss://mainnet.infura.io/ws/v3/ xxxxxxxxxxxxxxxxxxx ")

let topic = ethers.utils.id("nameRegistered(bytes32,address,uint256)");



// LP Value to compare to
let priceOfOneLP;

// const LPValueStartup = async () => {
//     let reserves = await liqPool.functions.getReserves();
//     let totalLP = await liqPool.functions.totalSupply();
//     let LPDecimal = await liqPool.functions.decimals();
//     let USDCRes = parseFloat(reserves._reserve0.toString()) / (10 ** 6);
//     let totalValue = USDCRes * 2;
//     let LPs = totalLP / (10 ** LPDecimal);
//     let pricePerLP = totalValue / LPs;
//     priceOfOneLP = pricePerLP;
//     // console.log(pricePerLP);
// }

// const LPValueCheck = async () => {
//     let reserves = await liqPool.functions.getReserves();
//     let totalLP = await liqPool.functions.totalSupply();
//     let LPDecimal = await liqPool.functions.decimals();
//     let USDCRes = parseFloat(reserves._reserve0.toString()) / (10 ** 6);
//     let totalValue = USDCRes * 2;
//     let LPs = totalLP / (10 ** LPDecimal);
//     let pricePerLP = totalValue / LPs;
//     if (pricePerLP >= priceOfOneLP) {
//         let comparative = pricePerLP / priceOfOneLP;
//         if (comparative >= 1.05) {
//             console.log("Change of 5% up");
//             if (comparative >= 1.10) {
//                 console.log("change of 10% up");
//             }
//         }
//     } else if (pricePerLP < priceOfOneLP) {
//         let comparative = pricePerLP / priceOfOneLP;
//         if (comparative <= 0.95) {
//             console.log("change of 5% down");
//             if (comparative <= 0.90) {
//                 console.log("change of 10% down");
//             }
//         }
//     }
// }
// LPValueStartup();

for (let i = 0; i < poolList.length; i++) {
    const poolAddr = poolList[i].uniswapAddress;
    let liqPool = new ethers.Contract(poolAddr, uniPoolABI, provider);

    let filter = {
        address: poolAddr,
        topics: [ topic ]
    }
    
    provider.on(filter, (result) => {
        console.log("1");
    })
    
    liqPool.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
        let USDCIn = parseFloat(amount0In.toString());
        USDCIn = USDCIn / (10 ** 6);
    
        let ETHIn = parseFloat(amount1In.toString());
        ETHIn = ETHIn / (10 ** 18);
    
        let USDCOut = parseFloat(amount0Out.toString());
        USDCOut = USDCOut / (10 ** 6);
    
        let ETHOut = parseFloat(amount1Out.toString());
        ETHOut = ETHOut / (10 ** 18);
    
        if (USDCIn > 500000) {
            console.log("USDC IN: " + USDCIn + "  ETH out: " + ETHOut);
        } else if (USDCOut > 500000) {
            console.log("ETH In: " + ETHIn + "  USDC Out: " + USDCOut);
        }
    
        LPValueCheck();
        
    })
}


// runs once an hour
// const LPValueUpdator = setInterval(() => {
//     LPValueStartup();
// }, 60000)