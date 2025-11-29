import { Routes, Route } from "react-router-dom";
import './App.css'
import Tasks from './pages/Tasks';
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
        <Route path="/tasks" element={<Tasks />} />
      </Route>
    </Routes>
  )
}

export default App
