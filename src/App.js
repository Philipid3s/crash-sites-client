import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'

import './App.css';

const LATITUDE = 38.0366361;
const LONGITUDE = 97.31;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      crashes: []
    };
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      position => {},

      error => alert(error.message),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
  }

  // call api: longitude / latitude / km (rayon) (ex: https://crash-sites-api.herokuapp.com/api/v1/crashes/103.5/1.3/100) 
  callApi = async (latitude, longitude, km) => {
    // const response = await fetch(`https://crash-sites-api.herokuapp.com/api/v1/crashes/${this.state.longitude}/${this.state.latitude}/100`);
    const request = `http://localhost:5000/api/v1/crashes/${longitude}/${latitude}/${km}`;
    console.log(request);
    const response = await fetch(request);
    
    const json = await response.json();

    console.log(json);

    if (response.status !== 200) throw Error(json);

    return json;
  }

  componentDidMount() {

    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;

        this.callApi(latitude, longitude, 100) // 100 km de rayon
        .then(res => {
          this.setState({ 
            latitude: latitude,
            longitude: longitude,
            crashes: res });
        })
        .catch(err => console.log(err));
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: Infinity }
    )
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Crash sites geolocation: accidents involving commercial aircraft
          </p>
        </header>

        <div className="leaflet-container">
          <Map center={[this.state.latitude, this.state.longitude]} zoom={10}>
          <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          <Marker position={[this.state.latitude, this.state.longitude]}>
            <Popup>your current position</Popup>
          </Marker>

          {this.state.crashes.map(
                (crash, idx) => {
                  const pos = [parseFloat(crash.location.coordinates[1]), parseFloat(crash.location.coordinates[0])];

                  return(<Marker key={idx} position={pos}>
                          <Popup><a href={crash.url}>{crash.title}</a></Popup>
                        </Marker>)})}

          </Map>
        </div>
        
      </div>
    );
  }
}

export default App;
