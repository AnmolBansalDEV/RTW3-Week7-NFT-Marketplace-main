import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from "../Marketplace.json";
import { useLocation } from "react-router";
import PlacesAutocomplete from "react-places-autocomplete";
import {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";



export default function SellNFT() {
  const [formParams, updateFormParams] = useState({
    name: "",
    your_name: "",
    watercap: "",
    license: "",
    location: "",
    latitude: "",
    longitude: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const ethers = require("ethers");
  const [message, updateMessage] = useState("");
//   const location = useLocation();



  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value)
    console.log(results)
    let {lat, lng} = await getLatLng(results[0])
    console.log(lat)
    // let lng = await getLatLng(results[1])
    updateFormParams({...formParams, location: value, latitude: lat, longitude : lng})
    console.log(formParams)
  }
//   const handleGeoChange = ()=>{}

  //This function uploads the NFT image to IPFS
  async function OnChangeFile(e) {
    let file = e.target.files[0];
    //check for file extension
    try {
      //upload the file to IPFS
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        console.log("Uploaded image to Pinata: ", response.pinataURL);
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload", e);
    }
  }

  //This function uploads the metadata to IPFS
  async function uploadMetadataToIPFS() {
    const {
      name,
      your_name,
      watercap,
      license,
      location,
      latitude,
      longitude,
      description,
      price,
    } = formParams;
    //Make sure that none of the fields are empty
    // if( !name || !description || !price || !fileURL){
    //     return;
    // }

    const nftJSON = {
      name,
      your_name,
      watercap,
      license,
      location,
      latitude,
      longitude,
      description,
      price,
      image: fileURL,
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Uploaded JSON to Pinata: ", response);
        return response.pinataURL;
      }
    } catch (e) {
      console.log("error uploading JSON metadata:", e);
    }
  }

  async function listNFT(e) {
    e.preventDefault();

    //Upload data to IPFS
    try {
      const metadataURL = await uploadMetadataToIPFS();
      console.log(metadataURL);
      //After adding your Hardhat network to your metamask, this code will get providers and signers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      updateMessage("Please wait.. uploading (upto 5 mins)");

      //Pull the deployed contract instance
      let contract = new ethers.Contract(
        Marketplace.address,
        Marketplace.abi,
        signer
      );

      //massage the params to be sent to the create NFT request
      const price = ethers.utils.parseUnits(formParams.price, "ether");
      let listingPrice = await contract.getListingPrice();
      // console.log(listingPrice)
      listingPrice = listingPrice.toString();

      //actually create the NFT
      let transaction = await contract.createToken(metadataURL, price, {
        value: listingPrice,
      });
      await transaction.wait();

      alert("Successfully listed your NFT!");
      updateMessage("");
      updateFormParams({
        name: "",
        your_name: "",
        watercap: "",
        license: "",
        location: "",
        latitude: "",
        longitude: "",
        description: "",
        price: 0,
      });
      window.location.replace("/");
    } catch (e) {
      alert("Upload error" + e);
    }
  }

//   console.log("Working", process.env);
        console.log(formParams)
  return (
    <div className="">
      <Navbar></Navbar>
      <div className="flex flex-col place-items-center mt-10" id="nftForm">
        <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
          <h3 className="text-center font-bold text-purple-500 mb-8">
            Upload the details of the Water Resource you want to list
          </h3>
          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Water Resource Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="AquaDuct"
              onChange={(e) =>
                updateFormParams({ ...formParams, name: e.target.value })
              }
              value={formParams.name}
            ></input>
          </div>
          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="your_name"
            >
              Your Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="your_name"
              type="text"
              placeholder="Municipal corporation"
              onChange={(e) =>
                updateFormParams({ ...formParams, your_name: e.target.value })
              }
              value={formParams.your_name}
            ></input>
          </div>
          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="watercap"
            >
              Water Capacity in L
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="watercap"
              type="text"
              placeholder="2500"
              onChange={(e) =>
                updateFormParams({ ...formParams, watercap: e.target.value })
              }
              value={formParams.watercap}
            ></input>
              <a href="https://www.fao.org/fishery/docs/CDrom/FAO_Training/FAO_Training/General/x6705e/x6705e04.htm" style={{color: "blue", textDecoration: "underline"}} alt="web link">Know how to estimate the reservoir Capacity.</a>
          </div>
          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="license"
            >
              Enter the Certification
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="license"
              type="text"
              placeholder="Choose option"
              onChange={(e) =>
                updateFormParams({ ...formParams, license: e.target.value })
              }
              value={formParams.license}
            >
                <option value="">-- Choose --</option>
                <option value="IS 10500:2012-Safe drinking water">IS 10500:2012-Safe drinking water</option>
                <option value="IS 1172:1993-Basic requirement for water supply">IS 1172:1993-Basic requirement for water supply</option>
                <option value="IS 17842:2020-Water Supply management system">IS 17842:2020-Water Supply management system</option>
                {/* <option value="green">other</option> */}
            </select>
            <a href="http://www.cwc.gov.in/" style={{color: "blue", textDecoration: "underline"}} alt="web link">source: CWC</a>
            {/* <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="watercap"
            >
              Specify
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="watercap"
              type="text"
              placeholder="2500"
              onChange={(e) =>
                updateFormParams({ ...formParams, watercap: e.target.value })
              }
              value={formParams.watercap}
            ></input> */}
            
          </div>
          
          {/* <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="location"
            >
              Location
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="location"
              type="text"
              placeholder="Krishna Godavari basin"
              onChange={(e) =>
                updateFormParams({ ...formParams, location: e.target.value })
              }
              value={formParams.location}
            ></input>
          </div> */}

<PlacesAutocomplete
  value={formParams.location}
  onChange={(e)=> {updateFormParams(({...formParams, location: e}))}}
          
  onSelect={handleSelect}
>
  {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
    <div
    key={suggestions.description}
    >
        <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="location"
            >
              Location
            </label>
      <input
        {...getInputProps({
          placeholder: "Search Places ...",
          className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline",
        })}
      />
      <div className="autocomplete-dropdown-container">
        {loading && <div>Loading...</div>}
        {suggestions.map((suggestion) => {
          const className = suggestion.active
            ? "suggestion-item--active"
            : "suggestion-item";
          // inline style for demonstration purpose
          const style = suggestion.active
            ? { backgroundColor: "#fafafa", cursor: "pointer" }
            : { backgroundColor: "#ffffff", cursor: "pointer" };
          return (
            <div
              {...getSuggestionItemProps(suggestion, {
                className,
                style,
              })}
            >
              <span>{suggestion.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  )}
</PlacesAutocomplete>

          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="latitude"
            >
              Latitude
            </label>
            <input
            disabled={true}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="latitude"
              type="text"
            //   onChange={(e) =>
            //     updateFormParams({ ...formParams, latitude: e.target.value })
            //   }
              value={formParams.latitude}
            ></input>
          </div>
          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="longitude"
            >
              Longitude
            </label>
            <input
            disabled={true}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled"
              id="longitude"
              type="text"
            //   onChange={(e) =>
            //     updateFormParams({ ...formParams, longitude: e.target.value })
            //   }
              value={formParams.longitude}
            ></input>
          </div>
          <div className="mb-6">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="description"
            >
              NFT Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              cols="40"
              rows="5"
              id="description"
              type="text"
              placeholder="suitable for drinking purposes"
              value={formParams.description}
              onChange={(e) =>
                updateFormParams({ ...formParams, description: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-6">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="price"
            >
              Price (in ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Min 0.0001 ETH"
              step="0.01"
              value={formParams.price}
              onChange={(e) =>
                updateFormParams({ ...formParams, price: e.target.value })
              }
            ></input>
            <a href="https://iwaponline.com/wp/article/24/2/363/86359/Research-on-water-resources-pricing-model-under" style={{color: "blue", textDecoration: "underline"}} alt="web link">Know how to price your water resource</a>

          </div>
          <div>
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="image"
            >
              Upload Image
            </label>
            <input type={"file"} onChange={OnChangeFile}></input>
          </div>
          <br></br>
          <div className="text-green text-center">{message}</div>
          <button
            onClick={listNFT}
            className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
          >
            List for Sale
          </button>
        </form>
      </div>
    </div>
  );
}
