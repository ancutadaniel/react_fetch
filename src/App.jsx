import { useRef, useState, useEffect } from "react";

import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";
import Error from "./components/Error.jsx";

function App() {
  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorUpdating, setErrorUpdating] = useState();

  const getUserPlaces = async () => {
    setIsLoading(true);
    try {
      const places = await fetchUserPlaces();
      setUserPlaces(places);
    } catch (error) {
      setError({ message: error.message || "Failed to fetch places" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserPlaces();
  }, []);

  const handleStartRemovePlace = (place) => {
    setModalIsOpen(true);
    selectedPlace.current = place;
  };

  const handleStopRemovePlace = () => {
    setModalIsOpen(false);
  };

  const handleSelectPlace = async (selectedPlace) => {
    // this approach is optimistic, we assume that the request will succeed better user experience
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      // state is not available immediately after setting it
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdating({ message: error.message || "Error updating places" });
    }
  };

  const handleRemovePlace = async () => {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try {
      await updateUserPlaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdating({
        message: error.message || "Failed to delete place",
      });
    }

    setModalIsOpen(false);
  };

  const handleError = () => setErrorUpdating(null);

  return (
    <>
      <Modal open={errorUpdating} onClose={handleError}>
        {errorUpdating && (
          <Error
            title="An error occured!"
            message={errorUpdating.message}
            onConfirm={handleError}
          />
        )}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>
      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occured!" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            places={userPlaces}
            isLoading={isLoading}
            loadingText="Loading user places..."
            onSelectPlace={handleStartRemovePlace}
          />
        )}
        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
