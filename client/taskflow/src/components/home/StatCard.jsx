const StatCard = ({ icon, label, value, color, borderColor }) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border ${borderColor} dark:border-slate-700 hover:shadow-md transition-shadow flex items-start justify-between`}>
        <div>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{label}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
    </div>
);

export default StatCard;
