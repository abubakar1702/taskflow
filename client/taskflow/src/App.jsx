import { Routes, Route } from "react-router-dom";
import Tasks from './pages/Tasks';
import TaskDetail from "./pages/TaskDetail/TaskDetail";
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import PrivateLayout from './components/layouts/PrivateLayout';
import PublicLayout from './components/layouts/PublicLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnFocusLoss={false}
      />
    </>
  );
}

export default App;
