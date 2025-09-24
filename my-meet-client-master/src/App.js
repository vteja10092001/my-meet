import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>

      <ToastContainer
        position="top-center"
        toastClassName="!bg-white !rounded-md !shadow !text-xs !px-4 !py-0"
        bodyClassName="!text-xs !text-gray-800"
      />
    </Router>
  );
}

export default App;
