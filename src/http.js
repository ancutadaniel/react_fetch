export const fetchAvailablePlaces = async () => {
    const response = await fetch("http://localhost:3000/places");
    if (!response.ok) {
        let errMsg = "Something went wrong!";
        if (response.status === 404) {
            errMsg = "Not found!";
        }
        throw new Error(errMsg);
    }
    const data = await response.json();

    return data.places;
}

export const fetchUserPlaces = async () => {
    const response = await fetch("http://localhost:3000/user-places");

    if (!response.ok) {
        throw new Error("Failed to fetch user places.");
    }
    const data = await response.json();

    return data.places;
}


export const updateUserPlaces = async (places) => {
    const response = await fetch("http://localhost:3000/user-places", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ places }),
    });

    if (!response.ok) {
        throw new Error("Failed to update user places.");
    }

    const data = await response.json();

    return data.message;
}
