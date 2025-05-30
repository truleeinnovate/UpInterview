function Tab({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-4 flex items-center text-sm font-medium border-b-2 ${
        active
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } focus:outline-none transition-colors duration-150`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {count !== undefined && (
        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
          active ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

export default Tab

export { Tab }