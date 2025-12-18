import { FaTasks, FaCheckCircle, FaClock, FaProjectDiagram } from 'react-icons/fa';
import StatCard from './StatCard';

const Stat = ({ stats, projectsLength }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FaTasks className="text-blue-600" />} label="Pending Tasks" value={stats.pending} color="bg-blue-50" borderColor="border-blue-100" />
        <StatCard icon={<FaCheckCircle className="text-green-600" />} label="Completed Tasks" value={stats.completed} color="bg-green-50" borderColor="border-green-100" />
        <StatCard icon={<FaClock className="text-orange-600" />} label="Overdue Tasks" value={stats.overdue} color="bg-orange-50" borderColor="border-orange-100" />
        <StatCard icon={<FaProjectDiagram className="text-purple-600" />} label="Active Projects" value={projectsLength} color="bg-purple-50" borderColor="border-purple-100" />
    </div>
);

export default Stat;
