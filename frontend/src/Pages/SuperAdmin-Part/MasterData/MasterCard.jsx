// v1.0.0 - Ashok - Added description

import React from "react";
import { Link } from "react-router-dom";

const MasterCard = ({ items }) => {
  return (
    // v1.0.0 <-----------------------------------------------------------------------------
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Link key={item.key} to={`/master-data/${item.key}`}>
          <div className="flex flex-col items-center p-6 border border-gray-200 bg-white shadow-lg rounded-2xl cursor-pointer hover:shadow-lg hover:scale-105 transition-transform">
            <div className="flex justify-center items-center gap-3 mb-3">
              <span className="text-custom-blue">{item.icon}</span>
              <p className="text-lg font-medium">{item.label}</p>
            </div>
            <p className="text-sm font-medium text-center text-gray-500">
              {item.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
    // v1.0.0 ----------------------------------------------------------------------------->
  );
};

export default MasterCard;
