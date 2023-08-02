import { useGeolocated } from "react-geolocated";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "../App.css"
import React, {useState} from 'react'
import Navbar from "./Navbar";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";


export default function GeoMap() {
    const {
        coords,
        isGeolocationAvailable,
        isGeolocationEnabled
      } = useGeolocated({
        positionOptions: {
          enableHighAccuracy: false
        },
        userDecisionTimeout: 5000
      });


      const [data, updateData] = useState([{}]);
const [dataFetched, updateFetched] = useState(false);

async function getAllNFTs() {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    let transaction = await contract.fetchMarketItems()
    //Fetch all the details of every NFT from the contract and display
    const items = await Promise.all(transaction.map(async i => {
        let tokenURI = await contract.tokenURI(i.tokenId);
        console.log(i)
        const myArray1 = tokenURI.split("/");
        tokenURI = "https://ipfs.io/ipfs/"+ myArray1[4] ;
        

        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let imageLink = `${meta.image}` ;
        console.log(i.price.toString())
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

        const myArray2 = imageLink.split("/");
        let image = "https://ipfs.io/ipfs/"+ myArray2[4] ;


        let item = {
            price: price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            your_name: meta.your_name,
            watercap: meta.watercap,
            license: meta.license,
            location: meta.location,
            latitude: meta.latitude,
            longitude: meta.longitude,
            image: image,
            name: meta.name,
            description: meta.description,
        }
        return item;
    }))

    updateFetched(true);
    updateData(items);
}


if(!dataFetched)
    getAllNFTs();


console.log(data)
  return !isGeolocationAvailable ? (
    <div>Your browser does not support Geolocation</div>
  ) : !isGeolocationEnabled ? (
    <div>Geolocation is not enabled</div>
  ) : coords ? (
    <div style={{ height: "100vh" }}>
        <Navbar />
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={5}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((item, index) => {
            let lat=parseFloat(item.longitude);
            console.log("Location is "+lat)
            
            return (
              isNaN(lat) ? (null) :

            <Marker key={index} position={[ parseFloat(item.latitude), parseFloat(item.longitude)]}>
              <Popup>
                <strong>Position: </strong> {parseFloat(item.latitude) + "," + parseFloat(item.longitude)} <br />
                <strong>Token ID: </strong> {item.tokenId}
                <br />
                <strong>Water Resource Capacity: </strong> {item.watercap} <em>L</em>
                <br />
                <strong>Price: </strong> {item.price} <em>ETH</em>
                <br />
                <strong>Link: </strong>{" "}
                <a href={`nftpage/${item["tokenId"]}`}>Buy here</a>
                <br />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  ) : (
    <div>Getting the location data&hellip; </div>
  );
}