import { DataProvider } from "./context/Data";
import { Main } from "./pages/Main";
import { ToastContainer, Zoom } from "react-toastify";

function App() {
  return (
    <DataProvider>
      <div className="App">
        <Main />
      </div>
      <ToastContainer
        closeButton={false}
        position="bottom-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={true}
        theme="dark"
        transition={Zoom}
      />
    </DataProvider>
  );
}

export default App;
