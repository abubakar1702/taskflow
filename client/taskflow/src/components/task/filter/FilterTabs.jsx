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
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none scale-105"
                : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-slate-800"
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