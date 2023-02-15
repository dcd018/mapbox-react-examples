const initial = {
  "type": "Feature",
  "properties": {"id": "foo"},
  "geometry": {
    "coordinates": [
      [-122.48959447026624, 37.83392300781851],
      [-122.48671609753919, 37.833885245088965]
    ],
    "type": "LineString"
  }
};

const update = {
  "type": "Feature",
  "properties": {"id": "bar"},
  "geometry": {
    "coordinates": [
      [-122.48914502336203, 37.833364117449776],
      [-122.48692647694118, 37.83339432784814]
    ],
    "type": "LineString"
  }
};

const style = {
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
};

export { initial, update, style }