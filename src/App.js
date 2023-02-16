import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"

function App() {

  const [panel, setPanel] = useState(null);

  const List = () => {
    return (
      <Row className="g-0">
        <Col xs={12} className="ps-3">
          <p>List</p>
  
          <Button className="mt-2" onClick={() => setPanel("edit")}>
            Edit
          </Button>
        </Col>
      </Row>
    );
  }
  
  const Edit = () => {
    return (
      <Row className="g-0">
        <Col xs={12} className="ps-3">
          <p>Edit</p>
  
          <Button className="mt-2" onClick={() => setPanel("list")}>
            List
          </Button>
        </Col>
      </Row>
    );
  }

  useEffect(() => {
    if (window.location.href.match("edit")) {
      setPanel("edit")
    }
    else {
      setPanel("list")
    }
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, panel);
  }, [panel]);

  return (
    <div className="App">
      {panel == "list" && (
        <List />
      )}
      {panel == "edit" && (
        <Edit />
      )}
    </div>
  );
}

export default App;
