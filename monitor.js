const ethers = require('ethers');
const Web3 = require("web3");

const uniPoolABI = require("./ABIS/uniPool.js");
const poolList = require("./config.js");

const ETHUSDCPool = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc";

let provider = ethers.getDefaultProvider("wss://mainnet.infura.io/ws/v3/ xxxxxxxxxxxxxxxx ")

let topic = ethers.utils.id("nameRegistered(bytes32,address,uint256)");



// LP Value to compare to


const LPValueStartup = async (liqPool, stableCoin, stableCoinDecimal) => {
    let reserves = await liqPool.functions.getReserves();
    let totalLP = await liqPool.functions.totalSupply();
    let LPDecimal = 18;
    let USDCRes;
    if (stableCoin === 0) {
        USDCRes = parseFloat(reserves._reserve0.toString()) / (10 ** stableCoinDecimal);
    } else if (stableCoin === 1) {
        USDCRes = parseFloat(reserves._reserve1.toString()) / (10 ** stableCoinDecimal);
    }
    let totalValue = USDCRes * 2;
    let LPs = totalLP / (10 ** LPDecimal);
    let pricePerLP = totalValue / LPs;
    return pricePerLP;
    // console.log(pricePerLP);
}

const LPValueCheck = async (liqPool, stableCoin, stableCoinDecimal, priceOfOneLP) => {
    let reserves = await liqPool.functions.getReserves();
    let totalLP = await liqPool.functions.totalSupply();
    let LPDecimal = 18;
    let USDCRes;
    if (stableCoin === 0) {
        USDCRes = parseFloat(reserves._reserve0.toString()) / (10 ** stableCoinDecimal);
    } else if (stableCoin === 1) {
        USDCRes = parseFloat(reserves._reserve1.toString()) / (10 ** stableCoinDecimal);
    }
    
    let totalValue = USDCRes * 2;
    let LPs = totalLP / (10 ** LPDecimal);
    let pricePerLP = totalValue / LPs;
    if (pricePerLP >= priceOfOneLP) {
        let comparative = pricePerLP / priceOfOneLP;
        if (comparative >= 1.05) {
            console.log("Change of 5% up");
            if (comparative >= 1.10) {
                console.log("change of 10% up");
            }
        }
    } else if (pricePerLP < priceOfOneLP) {
        let comparative = pricePerLP / priceOfOneLP;
        if (comparative <= 0.95) {
            console.log("change of 5% down");
            if (comparative <= 0.90) {
                console.log("change of 10% down");
            }
        }
    }
}
// LPValueStartup();

for (let i = 0; i < poolList.length; i++) {
    const poolAddr = poolList[i].uniswapAddress;
    const category = poolList[i].category;
    const decimal0 = poolList[i].token0;
    const decimal1 = poolList[i].token1;
    const name0 = poolList[i].token0Name;
    const name1 = poolList[i].token1Name;
    let liqPool = new ethers.Contract(poolAddr, uniPoolABI, provider);

    let filter = {
        address: poolAddr,
        topics: [ topic ]
    }
    
    provider.on(filter, (result) => {
        console.log("1");
    })
    if (category === "Stablecoins") {
        let priceOfOneLP = LPValueStartup(liqPool, 0, decimal0);
        liqPool.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
            let toke0 = parseFloat(amount0In.toString());
            toke0 = toke0 / (10 ** decimal0);
        
            let toke1 = parseFloat(amount1In.toString());
            toke1 = toke1 / (10 ** decimal1);
        
            let toke0Out = parseFloat(amount0Out.toString());
            toke0Out = toke0Out / (10 ** decimal0);
        
            let toke1Out = parseFloat(amount1Out.toString());
            toke1Out = toke1Out / (10 ** decimal1);
        
            if (toke0 > 500000) {
                console.log(`${name0} IN:  ${toke0}  ${name1} out:  ${toke1Out}`)
                // console.log("USDC IN: " + toke0 + "  ETH out: " + toke1Out);
            } else if (toke0Out > 500000) {
                console.log(`${name1} In:  ${toke1}   ${name0} Out:  ${toke0Out}`);
                // console.log("ETH In: " + toke1 + "  USDC Out: " + toke0Out);
            }
            
            LPValueCheck(liqPool, 0, decimal0, priceOfOneLP);
            
        })
    } else if (category === "ETH-Stablecoin") {
        const baseAssetPos = poolList[i].baseAsset;
        let priceOfOneLP;
        if (baseAssetPos === 0) {
            priceOfOneLP = LPValueStartup(liqPool, baseAssetPos, decimal0);
        } else if (baseAssetPos === 1) {
            priceOfOneLP = LPValueStartup(liqPool, baseAssetPos, decimal1);
        }
        
        liqPool.on("Swap", async (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
            let toke0 = parseFloat(amount0In.toString());
            toke0 = toke0 / (10 ** decimal0);
        
            let toke1 = parseFloat(amount1In.toString());
            toke1 = toke1 / (10 ** decimal1);
        
            let toke0Out = parseFloat(amount0Out.toString());
            toke0Out = toke0Out / (10 ** decimal0);
        
            let toke1Out = parseFloat(amount1Out.toString());
            toke1Out = toke1Out / (10 ** decimal1);

            let comparativeIn;
            let comparativeOut;
            let otherIn;
            let otherOut;
            let comparativeName;
            let otherName;
            if (baseAssetPos === 0) {
                comparativeIn = toke0;
                comparativeOut = toke0Out;
                otherIn = toke1;
                otherOut = toke1Out;
                comparativeName = name0;
                otherName = name1;
            } else if (baseAssetPos === 1) {
                comparativeIn = toke1;
                comparativeOut = toke1Out;
                otherIn = toke0;
                otherOut = toke0Out;
                comparativeName = name1;
                otherName = name0;
            }
        
            if (comparativeIn > 500000) {
                console.log(`${comparativeName} IN:  ${comparativeIn}  ${otherName} out:  ${otherOut}`)
                // console.log("USDC IN: " + toke0 + "  ETH out: " + toke1Out);
            } else if (comparativeOut > 500000) {
                console.log(`${otherName} In:  ${otherIn}   ${comparativeName} Out:  ${comprativeOut}`);
                // console.log("ETH In: " + toke1 + "  USDC Out: " + toke0Out);
            }
            if (baseAssetPos === 0) {
                LPValueCheck(liqPool, baseAssetPos, decimal0, priceOfOneLP);
            } else if (baseAssetPos === 1) {
                LPValueCheck(liqPool, baseAssetPos, decimal1, priceOfOneLP);
            }
            
            
        })
    }
    
}


// runs once an hour
// const LPValueUpdator = setInterval(() => {
//     LPValueStartup();
// }, 60000)