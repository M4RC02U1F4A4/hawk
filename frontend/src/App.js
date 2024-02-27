import { DataProvider } from "./context/Data";
import { Main } from "./pages/Main";

function App() {
  return (
    <DataProvider>
      <Main />
    </DataProvider>
  );
}

export default App;
