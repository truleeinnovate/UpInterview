
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
  <div className="flex justify-between items-center mb-8">
    <h3 className="text-2xl font-bold text-custom-blue sm:text-lg">
      Documents
    </h3>
    <button className="sm:px-4 sm:py-2 px-3 py-[7px] bg-custom-blue text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 sm:text-sm">
      <UploadCloud className="w-5 h-5" />
      <span>Upload Document</span>
    </button>
  </div>

  {documents.length === 0 ? (
    <p className="text-gray-500 text-center py-16">No documents available</p>
  ) : (
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
  )}
</div>

  );
};

export default Documents;
