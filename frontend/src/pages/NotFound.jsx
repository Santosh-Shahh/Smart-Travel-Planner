import { Link } from 'react-router-dom';
import { FaMapMarkedAlt } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md w-full shadow-lg">
        <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaMapMarkedAlt className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Off the Map!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for has packed its bags and left, or maybe it never existed.
        </p>
        <Link 
          to="/" 
          className="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
