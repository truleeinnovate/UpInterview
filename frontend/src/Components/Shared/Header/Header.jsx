import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/ui/button';

const Header = ({ title, onAddClick, addButtonText = 'Add New' }) => {

  return (
    <>
      <motion.div
        className="flex justify-between items-center py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl  font-semibold  text-custom-blue  ">
          {title}
        </h1>
        <Button
          onClick={onAddClick}
          size="sm" className="bg-custom-blue hover:bg-custom-blue/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          {addButtonText}
        </Button>
      </motion.div>
    </>
  );
};

export default Header;