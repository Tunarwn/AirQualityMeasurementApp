import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView() {
  return (
    <MapContainer
      center={[39.9255, 32.8663]}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", border: "2px solid red" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
      />
    </MapContainer>
  );
}
