import { ExternalLink, AlertCircle } from 'lucide-react';

export default function VideoSDKSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(33, 121, 137)' }}>
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">VideoSDK Setup Required</h1>
              <p className="text-gray-600">Configure your VideoSDK credentials to enable video calling</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              The video calling feature requires VideoSDK API credentials. Follow the steps below to get started.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Setup Instructions</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>
                  <span className="font-medium">Create a VideoSDK Account</span>
                  <p className="ml-6 text-sm text-gray-600 mt-1">
                    Visit <a href="https://app.videosdk.live/signup" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: 'rgb(33, 121, 137)' }}>
                      VideoSDK Signup <ExternalLink className="inline w-3 h-3" />
                    </a> and create a free account
                  </p>
                </li>

                <li>
                  <span className="font-medium">Get Your API Credentials</span>
                  <p className="ml-6 text-sm text-gray-600 mt-1">
                    After signing in, go to the <a href="https://app.videosdk.live/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: 'rgb(33, 121, 137)' }}>
                      API Keys section <ExternalLink className="inline w-3 h-3" />
                    </a> and copy your API Key and Secret Key
                  </p>
                </li>

                <li>
                  <span className="font-medium">Configure Supabase Edge Function Secrets</span>
                  <p className="ml-6 text-sm text-gray-600 mt-1">
                    You need to add your VideoSDK credentials as secrets to your Supabase project. Run these commands in your terminal:
                  </p>
                  <div className="ml-6 mt-2 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-green-400 block">
                      npx supabase secrets set VIDEOSDK_API_KEY=your_api_key_here
                    </code>
                    <code className="text-sm text-green-400 block mt-2">
                      npx supabase secrets set VIDEOSDK_SECRET_KEY=your_secret_key_here
                    </code>
                  </div>
                </li>

                <li>
                  <span className="font-medium">Refresh the Application</span>
                  <p className="ml-6 text-sm text-gray-600 mt-1">
                    After setting up the secrets, refresh this page to start using video calling features
                  </p>
                </li>
              </ol>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Check out the VideoSDK documentation for more information:
              </p>
              <a
                href="https://docs.videosdk.live/docs/guide/video-and-audio-calling-api-sdk/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'rgb(33, 121, 137)' }}
              >
                <span>View Documentation</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
