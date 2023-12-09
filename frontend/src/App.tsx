import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { NavBar } from "./components/NavBar";

import { DataContextProvider } from "./contexts/DataContextProvider";
import ServicesPage from "./pages/services";
import { ToastContainer } from "react-toastify";

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
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton={false}
        theme="dark"
      />
    </DataContextProvider>
  );
}

export default App;
