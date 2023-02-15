import { fromEventPattern, BehaviorSubject, filter, switchMap, take, distinctUntilChanged } from "rxjs";
import React, { useState, useEffect, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import bbox from "@turf/bbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { initial, update, style } from "./data";
import { isEqual } from "lodash";

mapboxgl.accessToken = 'pk.eyJ1IjoiZGNkMDExODEiLCJhIjoiY2w3ZmpuMGMxMGF4MzN3bmgwbW9iaDlzYiJ9.elokTYsJLUAZCwT7wEl9MQ';

function App() {

  const map = useRef(null);

  const [data, setData] = useState(initial);

  const ref = useCallback(node => {
    map.current = new mapboxgl.Map({
      container: node,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.486052, 37.830348],
      zoom: 14
    });
  }, [map]);

  const [sourceData] = useState(fromEventPattern(
    handler => map.current.on("sourcedata", handler),
    handler => map.current.off("sourcedata", handler)
  ).pipe(
    filter(e => e.sourceId == "route" && e.isSourceLoaded),
    take(1)
  ));

  const [mapLoad] = useState(fromEventPattern(
    handler => map.current.on("load", handler),
    handler => map.current.off("load", handler)
  ));

  const [subject] = useState(new BehaviorSubject(null));
  const [dataLoad] = useState(subject.asObservable().pipe(distinctUntilChanged(isEqual)));
  const [sourceLoad] = useState(dataLoad.pipe(switchMap(() => sourceData)));

  useEffect(() => {
    const subscriptions = [
      mapLoad.subscribe(onMapLoad),
      dataLoad.subscribe(onDataLoad),
      sourceLoad.subscribe(onSourceLoad)
    ];
    return () => subscriptions.forEach(
      subscription => subscription.unsubscribe()
    );
  }, []);

  useEffect(() => {
    subject.next(data);
  }, [data]);


  function onMapLoad() {
    map.current.addSource("route", { "type": "geojson", "data": data});
    map.current.addLayer(style);
  }

  function onDataLoad(e) {
    const source = map.current.getSource("route");
    if (source && map.current.isSourceLoaded("route")) {
      source.setData(e);
    }
  }

  function onSourceLoad(e) {
    const [xmin, ymin, xmax, ymax] = bbox(e.source.data);
    map.current.fitBounds([[xmin, ymin], [xmax, ymax]]);
  }

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
