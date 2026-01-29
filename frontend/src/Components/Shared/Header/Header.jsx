// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Added Bulk upload button (used in candidates)

import React from "react";
import { motion } from "framer-motion";
import { Plus, Upload } from "lucide-react";
// import { Button } from "../../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button";
import { Button } from "../../../Components/Buttons/Button";

const Header = ({
  title,
  onAddClick,
  addButtonText = "Add New",
  canCreate,
  onBulkUploadClick,
}) => {
  return (
    <motion.div
      className="flex justify-between items-center py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* v1.0.0 <------------------------------------------------------------------------ */}
      {/* <h1 className="text-2xl font-semibold text-custom-blue"> */}
      <h1 className="sm:text-xl md:text-xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-semibold text-custom-blue">
        {/* v1.0.0 ------------------------------------------------------------------------> */}
        {title}
      </h1>
      {/* {canCreate && (
        <Button
          onClick={onAddClick}
          size="sm"
          className="bg-custom-blue hover:bg-custom-blue/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          {addButtonText}
        </Button>
      )} */}
      <div className="flex items-center gap-2">
        {/* Render Bulk Upload button only if the prop is passed */}
        {/* dont remove this code -ashraf */}
        {/* {onBulkUploadClick && (
          <Button
            onClick={onBulkUploadClick}
            size="sm"
            variant="outline"
            className="border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-1" />
            Bulk Upload
          </Button>
        )} */}

        {canCreate && (
          <Button
            onClick={onAddClick}
            size="sm"
            className="bg-custom-blue hover:bg-custom-blue/90 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default Header;
