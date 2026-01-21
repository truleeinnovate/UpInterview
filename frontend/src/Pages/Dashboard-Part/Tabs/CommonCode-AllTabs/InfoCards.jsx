// v1.0.0 - Ashok - Removed bg white

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

const InfoGuide = ({
  title,
  items,
  isOpen: controlledIsOpen,
  onToggle,
  showBullets = true,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  return (
    // <div className="px-[13%] sm:px-[5%] md:px-[5%]">
    // v1.0.0 <----------------------------------------------
    // <div className="py-2 bg-white z-10">
    // v1.0.0 ---------------------------------------------->
    <div className="py-2 z-10">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div
          className="flex items-start space-x-3 cursor-pointer"
          onClick={toggle}
        >
          <Info className="h-5 w-5 text-custom-blue flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-custom-blue">{title}</h3>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-custom-blue" />
              ) : (
                <ChevronDown className="h-5 w-5 text-custom-blue" />
              )}
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-3 ml-8 space-y-2">
            <div className="text-sm text-custom-blue space-y-1">
              {/* <ul className="list-disc list-inside pl-2 space-y-1"> */}
              <ul
                className={`pl-2 space-y-1 ${
                  showBullets ? "list-disc list-inside" : "list-none"
                }`}
              >
                {items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
    // {/* </div> */}
  );
};

export default InfoGuide;
