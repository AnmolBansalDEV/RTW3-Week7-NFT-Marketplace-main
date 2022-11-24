import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
let [updatePrice, setUpdatePrice] = useState(0)
const [currAddress, updateCurrAddress] = useState("0x");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    let tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    console.log(listedToken)
    let myArray1 = tokenURI.split("/");
    tokenURI = "https://ipfs.io/ipfs/" + myArray1[4]
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);
    let imageLink = `${meta.image}` ;
       

        const myArray2 = imageLink.split("/");
        let image = "https://ipfs.io/ipfs/"+ myArray2[4] ;
    console.log(meta)
    let item =  {
        price : listedToken.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        your_name: meta.your_name,
        watercap: meta.watercap,
        license: meta.license,
        location: meta.location,
        latitude: meta.latitude,
        longitude: meta.longitude,
        image: image,
        name: meta.name,
        description: meta.description,
    };
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.createMarketSale(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}
async function resellNFT(tokenId , updatedPrice) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const listingPrice = await contract.getListingPrice();
        updateMessage("Relisting the NFT for sale... Please Wait (Upto 5 mins)")
        //run the executeSale function
        // const amount = ethers.utils.parseUnits(updatedPrice, 'decimals')
        
        let transaction = await contract.resellToken(tokenId, updatedPrice, {value: listingPrice.toString()});
        await transaction.wait();

        alert('You successfully relisted the NFT!');
        updateMessage("");
    }
    catch(e) {
        console.log("resell Error"+ e)
    }
}


    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);

    return(
        <div style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Seller: <span className="">{data.your_name}</span>
                    </div>
                    <div>
                        Water capacity in litres: <span className="">{data.watercap}</span>
                    </div>
                    <div>
                        License: <span className="">{data.license}</span>
                    </div>
                    <div>
                        Location: <span className="">{data.location}</span>
                    </div>
                    <div>
                        Latitude : <span className="">{data.latitude}</span>
                    </div>
                    <div>
                        Longitude: <span className="">{data.longitude}</span>
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                    { currAddress === data.owner || currAddress === data.seller ?
                    <div className="flex">
                        <label className="flex-none mr-3 w-44 h-5 block text-purple-500 text-sm font-bold mb-2" htmlFor="newPrice">Enter the new price for the water Resource in ETH</label>
                    <input className="flex-auto w-27 mr-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="newPrice" type="text" placeholder="enter the amount" onChange={e => setUpdatePrice(e.target.value)} value={updatePrice}></input>
                        <button className="flex-auto w-44 enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => resellNFT(tokenId,updatePrice)}>Resell this water Resource</button>
                    </div>
                        : <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this water Resource</button>
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}