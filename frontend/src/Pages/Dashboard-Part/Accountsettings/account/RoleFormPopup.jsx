import { useState } from 'react'
import { SidePopup } from '../common/SidePopup'
import { accessHierarchy } from '../mockData/accessHierarchy'


export function RoleFormPopup({ role, permissionCategories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || {},
    isDefault: role?.isDefault || false,
    level: role?.level || 5,
    inherits: role?.inherits || [],
    canAssign: role?.canAssign || []
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handlePermissionChange = (category, permission) => {
    const currentPerms = formData.permissions[category] || []
    const updatedPerms = currentPerms.includes(permission)
      ? currentPerms.filter(p => p !== permission)
      : [...currentPerms, permission]

    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [category]: updatedPerms
      }
    }))
  }

  const handleInheritChange = (roleId) => {
    const updatedInherits = formData.inherits.includes(roleId)
      ? formData.inherits.filter(id => id !== roleId)
      : [...formData.inherits, roleId]

    setFormData(prev => ({
      ...prev,
      inherits: updatedInherits
    }))
  }

  const handleAssignableChange = (roleId) => {
    const updatedAssignable = formData.canAssign.includes(roleId)
      ? formData.canAssign.filter(id => id !== roleId)
      : [...formData.canAssign, roleId]

    setFormData(prev => ({
      ...prev,
      canAssign: updatedAssignable
    }))
  }

  const availableForInheritance = Object.entries(accessHierarchy)
    .filter(([id, config]) => config.level > formData.level)
    .sort((a, b) => a[1].level - b[1].level)

  const availableForAssignment = Object.entries(accessHierarchy)
    .filter(([id, config]) => config.level > formData.level)
    .sort((a, b) => a[1].level - b[1].level)

  return (
    <SidePopup
      title={role ? 'Edit Role' : 'Create New Role'}
      onClose={onClose}
      position="right"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="mb-8">
          <h3 className="text-base sm:text-lg font-medium mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hierarchy Level
              </label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="10"
                required
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Lower numbers have higher authority (1 is highest)</p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Set as default role</span>
              </label>
            </div>
          </div>
        </div>

        {/* Role Hierarchy Section */}
        <div className="mb-8 border-b pb-6">
          <h3 className="text-base sm:text-lg font-medium mb-4">Role Hierarchy</h3>
          
          {/* Inherits From */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Inherits Permissions From</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {availableForInheritance.map(([roleId, config]) => (
                <label key={roleId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.inherits.includes(roleId)}
                    onChange={() => handleInheritChange(roleId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {roleId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    <span className="text-gray-500 text-xs ml-2">(Level {config.level})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Can Assign Roles */}
          <div>
            <h4 className="font-medium mb-2">Can Assign Roles</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {availableForAssignment.map(([roleId, config]) => (
                <label key={roleId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.canAssign.includes(roleId)}
                    onChange={() => handleAssignableChange(roleId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {roleId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    <span className="text-gray-500 text-xs ml-2">(Level {config.level})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="space-y-6">
          <h3 className="text-base sm:text-lg font-medium">Permissions</h3>
          
          {/* General Permissions */}
          <div className="border-b pb-6">
            <h4 className="font-medium mb-4">General Permissions</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {permissionCategories.map(category => (
                <div key={category.id} className="space-y-2">
                  <h5 className="font-medium">{category.name}</h5>
                  <div className="space-y-2">
                    {category.permissions.map(permission => (
                      <label key={permission.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(formData.permissions[category.id] || []).includes(permission.id)}
                          onChange={() => handlePermissionChange(category.id, permission.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Position Permissions */}
          <div className="border-b pb-6">
            <h4 className="font-medium mb-4">Position Management</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['view', 'create', 'edit', 'delete'].map(action => (
                <label key={action} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(formData.permissions.positions || []).includes(action)}
                    onChange={() => handlePermissionChange('positions', action)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {action} Positions
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Candidate Permissions */}
          <div>
            <h4 className="font-medium mb-4">Candidate Management</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['view', 'create', 'edit', 'delete', 'rate', 'contact'].map(action => (
                <label key={action} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(formData.permissions.candidates || []).includes(action)}
                    onChange={() => handlePermissionChange('candidates', action)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {action} Candidates
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 sticky bottom-0 bg-white pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {role ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </form>
    </SidePopup>
  )
}