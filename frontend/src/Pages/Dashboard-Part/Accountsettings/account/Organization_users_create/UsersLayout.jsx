import { Outlet } from 'react-router-dom';
import Users from './Users'; // Your existing Users component

function UsersLayout() {
  return (
    <div>
      {/* Users List - takes 60% width */}
      {/* <div className="w-[60%] pr-4 overflow-y-auto"> */}
        <Users />
      {/* </div> */}
      
      {/* Content Area - takes 40% width */}
      {/* <div className="w-[40%] border-l pl-4 overflow-y-auto"> */}
        <Outlet /> {/* This will render UserForm or UserProfileDetails */}
      {/* </div> */}
    </div>
  );
}

export default UsersLayout;