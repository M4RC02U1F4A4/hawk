import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { NavBar } from "./components/NavBar";

import { DataContextProvider } from "./contexts/DataContextProvider";
import ServicesPage from "./pages/services";

const router = createBrowserRouter([
  { path: "/", element: <div>Home</div> },
  { path: "/services", element: <ServicesPage /> },
  { path: "/info", element: <div>Info</div> },
  { path: "*", element: <div>404</div> },
]);

function App() {
  return (
    <DataContextProvider>
      <div className="">
        <NavBar />
        <RouterProvider router={router} />
      </div>
    </DataContextProvider>
  );
}

export default App;
