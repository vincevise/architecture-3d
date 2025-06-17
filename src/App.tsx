import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import BasicScene from "./components/3d/fpv/basic-scene";
import CanteenFPV from "./components/3d/models/canteen";
import MassHousingFPV from "./components/3d/models/masshousing";
import ResidenceFPV from "./components/3d/models/residence";
import SafakatFPV from "./components/3d/models/safakathouse";
import AestheticSceneR3F from "./components/3d/aesthetic";
import Home from "./components/home";

function App() {
  return (
    <>
      <Router>
        <div className="w-screen h-screen">
          {/* <Navigation /> */}
          <main className="main-content">
            <Routes>
              {/* <Route path="/" element={<Home />} /> */}
              {/* <Route path="/about" element={<About />} /> */}
              <Route
                path="/canteen"
                element={
                  <BasicScene
                    camera_position={[-7, 22, -15]}
                    showToggleFPV={true}
                  >
                    <CanteenFPV />
                  </BasicScene>
                }
              />
              <Route
                path="/mass-housing"
                element={
                  <BasicScene
                    camera_position={[-7, 22, -15]}
                    showToggleFPV={true}
                  >
                    <MassHousingFPV />
                  </BasicScene>
                }
              />
              <Route
                path="/residence"
                element={
                  <BasicScene
                    camera_position={[-7, 22, -15]}
                    showToggleFPV={true}
                  >
                    <ResidenceFPV />
                  </BasicScene>
                }
              />
              <Route
                path="/safakat-house"
                element={
                  <BasicScene
                    camera_position={[-7, 22, -15]}
                    showToggleFPV={true}
                  >
                    <SafakatFPV />
                  </BasicScene>
                }
              />
               <Route
                path="/aesthetic"
                element={
                  
                    <AestheticSceneR3F />
                }
              />
               <Route
                path="/"
                element={
                  
                <Home/>
                }
              />
               {/* <Route
                path="/urban-sem"
                element={
                 
                    <UrbansemScene />
                }
              /> */}
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}

export default App;
