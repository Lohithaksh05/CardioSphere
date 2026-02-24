import { useState, useEffect } from 'react';
import { Button } from "@material-tailwind/react";

const LocationComponent = () => {
  const [userCoordinates, setUserCoordinates] = useState(null);
  

  useEffect(() => {
    // Check if geolocation is supported
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          // Get latitude and longitude
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Store the coordinates in a variable
          const coordinates = {
            latitude: latitude,
            longitude: longitude
          };

          // Set state with the user's coordinates
          setUserCoordinates(coordinates);
        },
        function (error) {
          console.error("Error getting user location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []); // Empty dependency array means this effect runs once, similar to componentDidMount
  const redirectToWebsite = () => {
    window.location.href = `https://www.google.com/maps/search/cardiac+hospitals+near+me+/${userCoordinates.latitude},${userCoordinates.longitude},15z/data=!3m1!4b1?entry=ttu`;
  };

  return (
    <div>
      <button onClick={redirectToWebsite}
          className="mt-4 text-red-700 hover:text-white border border-red-700 hover:bg-red focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-200 ease-in-out">
          
          Find Near By Hospitals
        </button>
    </div>
  );
};

export default LocationComponent;
