/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import EmailSettings from './EmailSettings';
// import WhatsAppSettings from '../components/settings/WhatsAppSettings';
// import GeneralSettings from '../components/settings/GeneralSettings';
// import NotificationSettings from '../components/settings/NotificationSettings';
// import IntegrationSettings from '../components/settings/IntegrationSettings';
// import SecuritySettings from '../components/settings/SecuritySettings';
// import TeamSettings from '../components/settings/TeamSettings';

function Settings({ onClose }) {
  // eslint-disable-next-line no-unused-vars
  const [activeTab, setActiveTab] = useState('email');

  const settingsTabs = [
    //{ id: 'general', label: 'General', icon: SettingsIcon, component: GeneralSettings },
    { id: 'email', label: 'Email', icon: Mail, component: EmailSettings },
    // { id: 'whatsapp', label: 'WhatsApp', icon: Phone, component: WhatsAppSettings },
    // { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
    // { id: 'integrations', label: 'Integrations', icon: Globe, component: IntegrationSettings },
    // { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
    // { id: 'team', label: 'Team', icon: Users, component: TeamSettings }
  ];

  const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component || EmailSettings;

  return (
    <>
    
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="text-lg font-medium">Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex h-[calc(90vh-73px)]">
        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <ActiveComponent />
        </div>
      </div>
      {/* <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div> */}
    
    </>
  );
}

export default Settings;