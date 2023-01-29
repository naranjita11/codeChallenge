const express = require('express');
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
app.listen(3000, () => {console.log('Listening on port 3000')});

// fn to fetch the sunrise / sunset times
const getSunTimes = async (coords) => {
    try {
        const lat = coords[0];
        const lng = coords[1];
        const api_url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}`;
        const fetch_response = await fetch(api_url);
        const json = await fetch_response.json();
        return [json.results.sunrise, json.results.sunset];
    } catch (error) {
        console.error(error);
    }
}

// Generate a list of 100 random lat / long points around the world
const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
}

let listOfCoords = [];
for (let i = 0; i < 100; i++) {
    const randomLat = getRandomNumber(-90, 90);
    const randomLng = getRandomNumber(-180, 180);
    listOfCoords.push([randomLat, randomLng]);
}

// Fetch sunrise/sunset times for all points, but never run more than 5 in parallel

let listOfSuntimes = [];
for (let i = 0; i < 20; i++) {
    let fiveAtATime = [];
    
    fiveAtATime.push(listOfCoords[i*5], listOfCoords[i*5+1], listOfCoords[i*5+2],listOfCoords[i*5+3],listOfCoords[i*5+4]);
    
    Promise.all(fiveAtATime.map((coords) => {
        return getSunTimes(coords);
    })).then((values) => {
        listOfSuntimes.push(values[0], values[1], values[2], values[3], values[4]);
    }).catch(error => {
        console.error(error);
    });
}

// Find earliest sunrise and list the day length for this time

