import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './index.css'
function App() {
  return (
    // <AuthProvider>
      // <NotificationProvider>
        // <Toaster position="bottom-center" />
        <RouterProvider router={router} />
      // </NotificationProvider>
    // {/* </AuthProvider> */}
  );
}

export default App
