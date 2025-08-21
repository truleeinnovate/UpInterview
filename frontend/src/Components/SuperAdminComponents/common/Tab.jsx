// v1.0.0 - Ashok - Changed Primary to custom blue color
function Tab({ active, onClick, icon, label, count }) {
  return (
    <button
      // v1.0.0 <------------------------------------------------------------------------------
      onClick={onClick}
      className={`px-4 py-4 flex items-center text-sm font-medium border-b-2 ${
        active
          ? "border-custom-blue text-custom-blue"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } focus:outline-none transition-colors duration-150`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {count !== undefined && (
        <span
          className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
            active
              ? "bg-custom-blue text-custom-blue"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
      {/*  v1.0.0 <------------------------------------------------------------------------------ */}
    </button>
  );
}

export default Tab;

export { Tab };
