import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  AiOutlineHome, 
  AiOutlineTeam, 
  AiOutlineUser, 
  AiOutlineFileText,
  AiOutlineCalendar,
  AiOutlineCheckSquare,
  AiOutlineDollar,
  AiOutlineCustomerService,
  AiOutlineSetting,
  AiOutlineClose
} from 'react-icons/ai'

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: AiOutlineHome },
    { name: 'Tenants', href: '/tenants', icon: AiOutlineTeam },
    { name: 'Candidates', href: '/candidates', icon: AiOutlineUser },
    { name: 'Positions', href: '/positions', icon: AiOutlineFileText },
    { name: 'Interviews', href: '/interviews', icon: AiOutlineCalendar },
    { name: 'Assessments', href: '/assessments', icon: AiOutlineCheckSquare },
    { name: 'Billing', href: '/billing', icon: AiOutlineDollar },
    { name: 'Support Tickets', href: '/support-tickets', icon: AiOutlineCustomerService },
    { name: 'Settings', href: '/settings', icon: AiOutlineSetting },
  ]

  return (
    <div className={`fixed inset-0 z-40 flex ${open ? 'transform-none' : '-translate-x-full md:translate-x-0'} transition-transform duration-300 ease-in-out md:static md:inset-auto md:translate-x-0`}>
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-sidebar h-full">
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="https://via.placeholder.com/40x40/4f46e5/ffffff?text=IA"
              alt="Interview Admin"
            />
            <span className="ml-2 text-xl font-semibold text-gray-900">Interview Admin</span>
          </div>
          <button
            type="button"
            className="md:hidden rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <AiOutlineClose size={24} />
          </button>
        </div>
        
        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatar}
                alt={user.name}
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role === 'super_admin' ? 'Super Admin' : 'Support Team'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
        
        {/* Logout button */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
      
      {/* Close sidebar overlay */}
      <div className="md:hidden" onClick={onClose}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
      </div>
    </div>
  )
}

export default Sidebar