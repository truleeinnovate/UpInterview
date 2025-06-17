import { Outlet } from 'react-router-dom';
import './user-styles.css';
import UsersAccountTab from './UsersAccountTab';


const UsersLayout = () => {
  

  return (
    <div className="w-full bg-gray-50 h-screen">
      <div className="invoice-tab-wrapper">
      <UsersAccountTab />
      <Outlet />
      </div>
    </div>
  );
}

export default UsersLayout;