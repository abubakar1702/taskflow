import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const RunningProjects = ({ projects }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View All ({projects.length}) <FaChevronRight size={10} />
            </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4 space-y-3">
            {projects.length > 0 ? (
                projects.slice(0, 4).map(project => (
                    <Link key={project.id} to={`/projects/${project.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            {project.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{project.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{project.description || "No description"}</p>
                        </div>
                    </Link>
                ))
            ) : (
                <div className="text-center py-6 text-gray-500">No active projects.</div>
            )}
            <Link to="/projects" className="block mt-4">
                <button className="w-full py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                    View All Projects
                </button>
            </Link>
        </div>
    </div>
);

export default RunningProjects;
