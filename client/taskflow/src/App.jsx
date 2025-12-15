import { Routes, Route } from "react-router-dom";
import Tasks from './pages/Tasks';
import TaskDetail from "./pages/TaskDetail/TaskDetail";
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import PrivateLayout from './components/layouts/PrivateLayout';
import PublicLayout from './components/layouts/PublicLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewTask from './pages/new task/NewTask';
import Projects from './pages/project/Projects';
import ProjectDetail from './pages/project/ProjectDetail';
import Team from './pages/Team';
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
          <Route path="/team" element={<Team />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/new-task" element={<NewTask />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
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
