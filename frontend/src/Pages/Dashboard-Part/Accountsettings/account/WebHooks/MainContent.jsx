
import React, { useState } from 'react';
import { Settings, Key, Activity, TestTube, FileText } from 'lucide-react';
import { ToastContainer } from './Toast';
import { useToast } from '../../../../../apiHooks/SettingsIntegrations/useToast';
import IntegrationsTab from './IntegrationsTab';
import ApiKeysTab from './ApiKeysTab';
import WebhookLogsTab from './WebhookLogsTab';
import TestWebhookTab from './TestWebhookTab';
import DocumentationTab from './DocumentationTab';

function MainContent() {
  const [activeTab, setActiveTab] = useState('integrations');
  const { toasts, removeToast } = useToast();

  const tabs = [
    { id: 'integrations', label: 'Webhooks', icon: Settings },
    { id: 'api-keys', label: 'External keys', icon: Key },
    { id: 'logs', label: 'Webhook Logs', icon: Activity },
    // { id: 'test', label: 'Test Webhook', icon: TestTube },//commented for temporary
    { id: 'docs', label: 'Documentation', icon: FileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'integrations':
        return <IntegrationsTab />;
      case 'api-keys':
        return <ApiKeysTab />;
      case 'logs':
        return <WebhookLogsTab />;
      // case 'test':
      //   return <TestWebhookTab />;
      case 'docs':
        return <DocumentationTab />;
      default:
        return <IntegrationsTab />;
    }
  };

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">HRMS/ATS Integration Hub</h1>
                <p className="text-sm text-gray-600 mt-1">Manage webhooks and API integrations</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-custom-blue text-custom-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </main>
        
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
  );
}

export default MainContent;
