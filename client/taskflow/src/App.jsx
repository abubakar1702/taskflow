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
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Home from './pages/Home';
import Important from './pages/Important';
import Notes from './pages/Notes';
import AllNotifications from './components/notification/AllNotifications';

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route element={<PrivateLayout />}>
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/new-task" element={<NewTask />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/important" element={<Important />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notifications" element={<AllNotifications />} />
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
