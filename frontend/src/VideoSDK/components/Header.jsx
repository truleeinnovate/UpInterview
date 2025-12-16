import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Header({ activeTab, setActiveTab, user }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const tabs = [
    { id: 'interviews', label: 'Interviews' },
    { id: 'question-bank', label: 'Question Bank' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'candidates', label: 'Candidates' },
    { id: 'people', label: 'People' },
    { id: 'chat', label: 'Chat' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center">
              <img
                src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
                alt="UpInterview Logo"
                className="w-24"
              />
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={activeTab === tab.id ? { backgroundColor: 'rgb(33, 121, 137)' } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 mt-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === tab.id ? { backgroundColor: 'rgb(33, 121, 137)' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
