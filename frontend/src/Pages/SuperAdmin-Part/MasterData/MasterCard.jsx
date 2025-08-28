import React from "react";
import { Link } from "react-router-dom";

const MasterCard = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Link
          key={item.key}
          to={`/master-data/${item.key}`}
          className="flex flex-col items-center justify-center p-6 border border-gray-200 bg-white shadow-lg rounded-2xl cursor-pointer hover:shadow-lg hover:scale-105 transition-transform"
        >
          <div className="text-custom-blue">{item.icon}</div>
          <p className="mt-3 text-lg font-medium">{item.label}</p>
        </Link>
      ))}
    </div>
  );
};

export default MasterCard;
