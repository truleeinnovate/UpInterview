// v1.0.0 <-------------------------------------------------------------------->
import { useState } from "react";
import { Minimize, Expand, X } from "lucide-react";

function SidebarPopup({ title, children, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`relative bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full h-screen flex flex-col ${
          isExpanded
            ? "w-full"
            : "w-full sm:w-full md:w-full lg:w-full xl:w-1/2 2xl:w-1/2"
        }`}
      >
        {/* v1.0.0 <-------------------------------------------------------------------- */}
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 z-10">
          {/* v1.0.0 ------------------------------------------------------------------> */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="ml-8 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue">
                {title}
              </h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleExpand}
                className="p-2 hidden md:flex lg:flex xl:flex 2xl:flex hover:text-gray-600 rounded-full hover:bg-gray-100"
                title={isExpanded ? "Compress" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize size={20} className="text-gray-500" />
                ) : (
                  <Expand size={20} className="text-gray-500" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* overflow-y-auto w-full h-[calc(100vh-5rem)] p-4 sm:p-6 */}
        {/* Popup content as children */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export default SidebarPopup;

