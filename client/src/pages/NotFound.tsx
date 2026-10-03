import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex-grow flex items-center justify-center flex-col p-4">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
