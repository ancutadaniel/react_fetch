import { useCallback, useEffect, useState } from "react";
import Places from "./Places.jsx";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";


export default function AvailablePlaces({ onSelectPlace }) {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const getPlaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const places = await fetchAvailablePlaces();
      
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Sort places by user position
        const sortedData = sortPlacesByDistance(places, lat, lng);
        setPlaces(sortedData);
        setIsLoading(false);
      });
    } catch (error) {
      setError({ message: error.message || "Something went wrong!" });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPlaces();
  }, [getPlaces]);

  if (error) {
    return (
      <Error
        title="An error occurred!"
        message={error.message}
        onConfirm={() => setError(null)}
      />
    );
  }

  return (
    <Places
      title="Available Places"
      places={places}
      isLoading={isLoading}
      loadingText="Loading places..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
