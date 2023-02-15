import React, { useState, useEffect, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import bbox from "@turf/bbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { initial, update, style } from "./data";

mapboxgl.accessToken = 'pk.eyJ1IjoiZGNkMDExODEiLCJhIjoiY2w3ZmpuMGMxMGF4MzN3bmgwbW9iaDlzYiJ9.elokTYsJLUAZCwT7wEl9MQ';

function App() {

  const map = useRef(null);

  const [sourceLoaded, setSourceLoaded] = useState(false);

  const [data, setData] = useState(initial);

  const ref = useCallback(node => {
    map.current = new mapboxgl.Map({
      container: node,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.486052, 37.830348],
      zoom: 14
    });
  }, [map]);

  const loadListener = useCallback(() => {
    map.current.addSource("route", {
      "type": "geojson",
      "data": data
    });
    map.current.addLayer(style);
  }, [map, data]);

  const dataListener = useCallback((e) => {
    if (e.sourceId == "route") {
      setSourceLoaded(e.isSourceLoaded);
    }
  }, []);

  useEffect(() => {
    map.current.once("sourcedata", dataListener);
    map.current.on("load", loadListener);

    return () => {
      map.current.off("load", loadListener);
    }
  }, []);

  useEffect(() => {
    if (sourceLoaded) {
      map.current.off("sourcedata", dataListener);
      const [xmin, ymin, xmax, ymax] = bbox(data);
      map.current.fitBounds([[xmin, ymin], [xmax, ymax]]);
    }
  }, [sourceLoaded]);

  useEffect(() => {
    map.current.on("sourcedata", dataListener);
    const source = map.current.getSource("route");
    if (source && map.current.isSourceLoaded("route")) {
      source.setData(data);
    }

    return () => {
      map.current.off("sourcedata", dataListener);
    }
  }, [data]);

  return (
    <div className="App">
      <button className="btn" onClick={() => setData(update)}
      >
        Update Data
      </button>
      <div className="map" ref={ref}></div>
    </div>
  );
}

export default App;
