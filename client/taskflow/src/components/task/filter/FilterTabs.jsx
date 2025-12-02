const FilterTabs = ({ activeTab, onTabChange }) => {
  const tabs = ["All", "Assigned to me", "Created by me"];

  return (
    <>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${
              activeTab === tab
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200 scale-105"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
            }
          `}
        >
          {tab}
        </button>
      ))}
    </>
  );
};

export default FilterTabs;