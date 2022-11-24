import { useGeolocated } from "react-geolocated";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { items } from "./data.js";
import "../App.css"
import React from 'react'
import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

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
        {items.map((e) => {
          return (
            <Marker key={e["Source ID"]} position={[e.Latitude, e.Longitude]}>
              <Popup>
                <strong>Pos: </strong> {e.Latitude + "," + e.Longitude} <br />
                <strong>Source id: </strong> {e["Source ID"]}
                <br />
                <strong>Capacity: </strong> {e.Capacity} <em>L</em>
                <br />
                <strong>Price: </strong> {e.Price} <em>ETH</em>
                <br />
                <strong>Link: </strong>{" "}
                <a href={`token/${e["Source ID"]}`}>Buy here</a>
                <br />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  ) : (
    <div>Getting the location data&hellip; </div>
  );
}