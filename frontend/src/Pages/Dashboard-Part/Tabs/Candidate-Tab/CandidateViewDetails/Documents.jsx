
import { format } from 'date-fns';
import { 
  File , 
  FileText , 
  Download , 
  Trash2 , 
  UploadCloud 
} from 'lucide-react';


const Documents = ({ documents }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'application/pdf':
        return <File className="text-red-500 w-8 h-8" />;
      case 'application/docx':
        return <FileText className="text-blue-500 w-8 h-8" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h3 className="text-2xl font-bold  text-custom-blue">
          Documents
        </h3>
        <button className="w-full sm:w-auto px-6 py-3 bg-custom-blue  text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
          <UploadCloud className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {documents.map((doc, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow bg-white group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg group-hover:scale-110 transition-transform">
                {getIcon(doc.type)}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{doc.name}</h4>
                <p className="text-sm text-gray-500">
                  {format(new Date(doc.uploadedDate), 'MMM dd, yyyy')} • {doc.size}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;