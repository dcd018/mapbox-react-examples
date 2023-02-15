import React, { useState, useEffect, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import bbox from "@turf/bbox";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = 'pk.eyJ1IjoiZGNkMDExODEiLCJhIjoiY2w3ZmpuMGMxMGF4MzN3bmgwbW9iaDlzYiJ9.elokTYsJLUAZCwT7wEl9MQ';

function App() {

  /**
   * A mutable ref object to store the main Mapbox instance.
   * The useRef hook will give us the same ref object on every render.
   */
  const map = useRef(null);

  /**
   * A state variable that tells us when the Mapbox source is loaded.
   */
  const [sourceLoaded, setSourceLoaded] = useState(false);

  /**
   * A state variable we use to update Mapbox source data.
   */
  const [data, setData] = useState({
    "type": "Feature",
    "properties": {},
    "geometry": {
      "coordinates": [
        [-122.48959447026624, 37.83392300781851],
        [-122.48671609753919, 37.833885245088965]
      ],
      "type": "LineString"
    }
  });

  /**
   * A cached function re-usable between re-renders.
   * We populate the map ref here, once the DOM node is available.
   */
  const ref = useCallback(node => {
    map.current = new mapboxgl.Map({
      container: node,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.486052, 37.830348],
      zoom: 14
    });
  }, [map]);

  /**
   * A cached listener re-usable between re-renders.
   * We initialize a Mapbox source and layer on the initial Mapbox "load" event.
   */
  const loadListener = useCallback(() => {
    map.current.addSource("route", {
      "type": "geojson",
      "data": data
    });
    map.current.addLayer({
      "id": "route",
      "type": "line",
      "source": "route",
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "#888",
        "line-width": 8
      }
    });
  }, [map, data]);

  /**
   * A cached listener re-usable between re-renders.
   * We set the sourceLoaded state variable on Mapbox sourcedata events.
   */
  const dataListener = useCallback((e) => {
    if (e.sourceId == "route") {
      setSourceLoaded(e.isSourceLoaded);
    }
  }, []);

  /**
   * An effect that runs once upon component mount.
   */
  useEffect(() => {
    // Register a sourcedata event listener that runs once.
    map.current.once("sourcedata", dataListener);

    // Register the load event listener that initializes the Mapbox source and layer.
    map.current.on("load", loadListener);

    return () => {
      // Remove the load event listener on component unmount.
      map.current.off("load", loadListener);
    }
  }, []);

  /**
   * An effect that runs upon sourceLoaded state variable change.
   */
  useEffect(() => {
    if (sourceLoaded) {
      // We first need to remove the current sourcedata listener once a source is loaded.
      // This is a side effect to updating component state within a native DOM event listener.
      // Mapbox will emit several sourcedata events and we only need to listen for the first one.  
      map.current.off("sourcedata", dataListener);

      // Once source data is loaded and the event listener is removed, we generate a bounding box
      // and fit the map to bounds.
      const [xmin, ymin, xmax, ymax] = bbox(data);
      map.current.fitBounds([[xmin, ymin], [xmax, ymax]]);
    }
  }, [sourceLoaded]);

  /**
   * An effect that runs upon data state variable change.
   */
  useEffect(() => {
    // Upon component mount, we register the sourcedata event listener to run once.
    // We need to register it again here because it will not exist during the second render.
    // We also need to re-register it during each subsequent render because dataListener is referencing
    // stale state data.
    map.current.on("sourcedata", dataListener);

    // It is possible that state data will change before the map's source is loaded.
    // We first check if a source exists before updating it with fresh state data.
    const source = map.current.getSource("route");
    if (source && map.current.isSourceLoaded("route")) {
      source.setData(data);
    }

    return () => {
      // This will run after each change to state data. Each effect needs to remove the listeners it registers
      // to avoid registering multiple listeners for the same event. 
      map.current.off("sourcedata", dataListener);
    }
  }, [data]);

  return (
    <div className="App">
      {/**
        * Update state data upon click with a new feature to simulate
        * a component receiving a new paginated list of projects. 
        */}
      <button className="btn" onClick={() => setData({
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [-122.48914502336203, 37.833364117449776],
            [-122.48692647694118, 37.83339432784814]
          ],
          "type": "LineString"
        }
      })}
      >
        Update Data
      </button>
      <div className="map" ref={ref}></div>
    </div>
  );
}

export default App;
