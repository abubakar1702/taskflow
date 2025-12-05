import { Routes, Route } from "react-router-dom";
import Tasks from './pages/Tasks';
import TaskDetail from "./pages/TaskDetail/TaskDetail";
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import PrivateLayout from './components/layouts/PrivateLayout';
import PublicLayout from './components/layouts/PublicLayout';

function App() {

  return (
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
  )
}

export default App
