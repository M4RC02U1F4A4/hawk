import { DataProvider } from "./context/Data";
import { Main } from "./pages/Main";

function App() {
  return (
    <DataProvider>
      <div className="App">
        <Main />
      </div>
    </DataProvider>
  );
}

export default App;
