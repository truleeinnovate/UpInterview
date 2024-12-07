import { PermifyProvider } from '@permify/react-role';

const roles = {
  admin: {
    can: ['view', 'edit', 'delete'],
  },
  user: {
    can: ['view'],
  },
  superadmin: {
    can: ['view', 'edit', 'delete', 'manage'],
  },
};

const PermifyConfig = ({ children }) => {
  return (
    <PermifyProvider roles={roles}>
      {children}
    </PermifyProvider>
  );
};

export default PermifyConfig;