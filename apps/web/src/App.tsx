import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './index.css'
import { Toaster } from "@bluethub/ui-kit"
import { useTokenRefresh } from './hooks/useTokenRefresh';

function App() {
  useTokenRefresh();

  return (
    <>
      <Toaster position="bottom-center" />
      <RouterProvider router={router} />
    </>
  );
}

export default App
