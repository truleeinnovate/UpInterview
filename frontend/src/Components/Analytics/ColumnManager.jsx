import React, { useState, useEffect } from 'react';
import { Settings, Plus, X, GripVertical, Eye, EyeOff, RotateCcw, Save } from 'lucide-react';

const ColumnManager = ({ 
  isOpen, 
  onClose, 
  columns = [], 
  onColumnsChange,
  availableColumns = [],
  type = 'table' // 'table' or 'dashboard'
}) => {
  const [activeColumns, setActiveColumns] = useState([]);
  const [availableToAdd, setAvailableToAdd] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    // Initialize active columns from props
    const active = columns.map((col, index) => ({
      ...col,
      id: col.key || col.id || `col-${index}`,
      visible: col.visible !== false,
      width: col.width || 'auto',
      order: index
    }));
    setActiveColumns(active);

    // Find available columns to add
    const activeKeys = active.map(col => col.key);
    const available = availableColumns.filter(col => !activeKeys.includes(col.key));
    setAvailableToAdd(available);
  }, [columns, availableColumns]);

  const handleDragStart = (e, item, sourceType) => {
    setDraggedItem({ item, sourceType });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, sourceType }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex, targetType) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const { item, sourceType } = draggedItem;

    if (sourceType === 'available' && targetType === 'active') {
      // Add column from available to active
      const newColumn = {
        ...item,
        id: item.key || `col-${Date.now()}`,
        visible: true,
        width: 'auto',
        order: targetIndex
      };

      const updatedActive = [...activeColumns];
      updatedActive.splice(targetIndex, 0, newColumn);
      
      // Update order for all columns
      const reorderedActive = updatedActive.map((col, index) => ({ ...col, order: index }));
      setActiveColumns(reorderedActive);

      // Remove from available
      setAvailableToAdd(prev => prev.filter(col => col.key !== item.key));
    } else if (sourceType === 'active' && targetType === 'active') {
      // Reorder within active columns
      const updatedActive = [...activeColumns];
      const dragIndex = updatedActive.findIndex(col => col.id === item.id);
      
      if (dragIndex !== -1 && dragIndex !== targetIndex) {
        const [draggedColumn] = updatedActive.splice(dragIndex, 1);
        updatedActive.splice(targetIndex, 0, draggedColumn);
        
        // Update order
        const reorderedActive = updatedActive.map((col, index) => ({ ...col, order: index }));
        setActiveColumns(reorderedActive);
      }
    }

    setDraggedItem(null);
  };

  const removeColumn = (columnId) => {
    const columnToRemove = activeColumns.find(col => col.id === columnId);
    if (!columnToRemove) return;

    // Remove from active
    const updatedActive = activeColumns.filter(col => col.id !== columnId);
    const reorderedActive = updatedActive.map((col, index) => ({ ...col, order: index }));
    setActiveColumns(reorderedActive);

    // Add back to available if it's not a custom column
    const originalColumn = availableColumns.find(col => col.key === columnToRemove.key);
    if (originalColumn) {
      setAvailableToAdd(prev => [...prev, originalColumn]);
    }
  };

  const toggleColumnVisibility = (columnId) => {
    const updatedActive = activeColumns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    setActiveColumns(updatedActive);
  };

  const updateColumnWidth = (columnId, width) => {
    const updatedActive = activeColumns.map(col =>
      col.id === columnId ? { ...col, width } : col
    );
    setActiveColumns(updatedActive);
  };

  const addCustomColumn = () => {
    const customColumn = {
      id: `custom-${Date.now()}`,
      key: `custom_${Date.now()}`,
      label: 'Custom Column',
      type: 'text',
      visible: true,
      width: 'auto',
      order: activeColumns.length,
      isCustom: true,
      render: (value) => value || '-'
    };

    setActiveColumns(prev => [...prev, customColumn]);
  };

  const resetToDefault = () => {
    const defaultColumns = columns.map((col, index) => ({
      ...col,
      id: col.key || `col-${index}`,
      visible: true,
      width: 'auto',
      order: index
    }));
    setActiveColumns(defaultColumns);

    // Reset available columns
    const activeKeys = defaultColumns.map(col => col.key);
    const available = availableColumns.filter(col => !activeKeys.includes(col.key));
    setAvailableToAdd(available);
  };

  const saveChanges = () => {
    const finalColumns = activeColumns.map(col => ({
      key: col.key,
      label: col.label,
      visible: col.visible,
      width: col.width,
      type: col.type,
      render: col.render,
      sortable: col.sortable,
      filterable: col.filterable,
      isCustom: col.isCustom
    }));

    onColumnsChange(finalColumns);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-custom-blue" />
              <h2 className="text-xl font-semibold text-custom-blue">
                Manage {type === 'dashboard' ? 'Dashboard' : 'Table'} Columns
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-8">
            {/* Active Columns */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Active Columns</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={addCustomColumn}
                    className="flex items-center space-x-1 px-3 py-1 bg-custom-blue text-white rounded-lg hover:bg-primary-600 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Custom</span>
                  </button>
                  <button
                    onClick={resetToDefault}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div 
                className="space-y-2 min-h-[300px] bg-gray-50 rounded-lg p-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, activeColumns.length, 'active')}
              >
                {activeColumns.map((column, index) => (
                  <div
                    key={column.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column, 'active')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index, 'active')}
                    className={`bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-all ${
                      !column.visible ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{column.label}</span>
                          {column.isCustom && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              Custom
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-600">Width:</label>
                            <select
                              value={column.width}
                              onChange={(e) => updateColumnWidth(column.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="auto">Auto</option>
                              <option value="100px">100px</option>
                              <option value="150px">150px</option>
                              <option value="200px">200px</option>
                              <option value="250px">250px</option>
                              <option value="300px">300px</option>
                            </select>
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            Type: {column.type || 'text'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleColumnVisibility(column.id)}
                          className={`p-1 rounded ${
                            column.visible 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={column.visible ? 'Hide' : 'Show'}
                        >
                          {column.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => removeColumn(column.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Remove column"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeColumns.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active columns. Drag columns from the right to add them.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Columns */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Columns</h3>
              
              <div className="space-y-2 min-h-[300px] bg-gray-50 rounded-lg p-4">
                {availableToAdd.map((column) => (
                  <div
                    key={column.key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column, 'available')}
                    className="bg-white rounded-lg p-3 border border-gray-200 cursor-move hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{column.label}</div>
                        <div className="text-xs text-gray-500">
                          Type: {column.type || 'text'}
                          {column.description && ` • ${column.description}`}
                        </div>
                      </div>
                      
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
                
                {availableToAdd.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>All available columns are already active.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Drag columns</strong> from Available to Active to add them</li>
              <li>• <strong>Reorder columns</strong> by dragging within the Active section</li>
              <li>• <strong>Toggle visibility</strong> with the eye icon (hidden columns stay in layout)</li>
              <li>• <strong>Remove columns</strong> with the X button (moves back to Available)</li>
              <li>• <strong>Adjust width</strong> using the dropdown for each column</li>
              <li>• <strong>Add custom columns</strong> for calculated fields or custom data</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activeColumns.filter(col => col.visible).length} visible columns, {activeColumns.length} total
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-custom-blue text-custom-blue rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnManager;