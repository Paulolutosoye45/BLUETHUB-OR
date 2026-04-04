import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './index.css'
import { Toaster } from "@bluethub/ui-kit"
function App() {
  return (
    <>
      <Toaster position="bottom-center" />
        <RouterProvider router={router} /> 
        <Toaster />
    </>
  );
}

export default App
