import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Form } from "./componenets/Form";

function App() {
  return (
    <div className="App">
      <div className="auth-wrapper">
        <div className="auth-inner">
          <Router>
            <Routes>
              <Route path="/" exact element={<Form />} />
              <Route path="/app" element={<Form />} />
            </Routes>
          </Router>

        </div>
      </div>

    </div>

  );
}

export default App;
