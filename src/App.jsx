import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";

export default function App() {
  const [markerCoordinatesArray, setMarkerCoordinatesArray] = useState([]);
  const position = { lat: 52.4823, lng: -1.89 };

  const handleMapClick = (event) => {
    setMarkerCoordinatesArray((prev) => {
      return [
        ...prev,
        { lat: event.detail.latLng.lat, lng: event.detail.latLng.lng },
      ];
    });
  };

  return (
    <div style={{ height: "50vh", width: "50%" }}>
      <APIProvider apiKey={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <Map
          center={position}
          zoom={9}
          mapId={import.meta.env.VITE_PUBLIC_MAP_ID}
          fullscreenControl={false}
          onClick={handleMapClick}
        ></Map>
        <Directions markerCoordinatesArray={markerCoordinatesArray} />
      </APIProvider>
    </div>
  );
}

function Directions({ markerCoordinatesArray }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const [directionsResult, setDirectionsResult] = useState();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (
      !directionsService ||
      !directionsRenderer ||
      markerCoordinatesArray.length < 2
    )
      return;
    directionsService
      .route({
        origin: {
          lat: markerCoordinatesArray[0]?.lat,
          lng: markerCoordinatesArray[0]?.lng,
        },
        destination: {
          lat: markerCoordinatesArray[1]?.lat,
          lng: markerCoordinatesArray[1]?.lng,
        },
        waypoints: markerCoordinatesArray[2]
          ? markerCoordinatesArray
              .slice(2)
              .map((marker) => ({
                location: { lat: marker.lat, lng: marker.lng },
                stopover: true,
              }))
          : [],
        travelMode: "DRIVING",
        optimizeWaypoints: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setDirectionsResult(directionsRenderer.getDirections());
      });
    // return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, markerCoordinatesArray]);

  console.log(directionsResult);

  return (
    <div className="directions">
      <h1>Directions</h1>
      {directionsResult && (
        <div>
          <h2>{directionsResult.routes[0].summary}</h2>
          <p>
            {directionsResult.routes[0].legs[0].start_address.split(",")[0]} to{" "}
            {directionsResult.routes[0].legs[0].end_address.split(",")[0]}
          </p>
          <p>Distance: {directionsResult.routes[0].legs[0].distance?.text}</p>
          <p>Duration: {directionsResult.routes[0].legs[0].duration?.text}</p>
          <h2>Detailed Steps</h2>
          <ol>
            {directionsResult.routes[0].legs[0].steps.map((step, index) => (
              <li key={index}>{step.instructions.replaceAll("<b>", "")}</li>
            ))}
          </ol>
        </div>
      )}
      {/* <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text}</p>

      <h2>Other Routes</h2>
      <ul>
        {routes.map((route, index) => (
          <li key={route.summary}>
            <button onClick={() => setRouteIndex(index)}>
              {route.summary}
            </button>
          </li>
        ))}
      </ul> */}
    </div>
  );
}
