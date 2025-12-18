const StatCard = ({ icon, label, value, color, borderColor }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${borderColor} hover:shadow-md transition-shadow flex items-start justify-between`}>
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
    </div>
);

export default StatCard;
