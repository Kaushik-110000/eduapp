import { Outlet, useLocation } from 'react-router-dom';

const AuthLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname.includes('login'); // check if login page

  return (
    <div className="min-h-screen flex">
      {/* If login page, image on right. If register, image on left */}
      {!isLoginPage && (
        <div className="hidden lg:flex w-1/2 bg-blue-600">
          <img 
            src="/auth-side-photo.jpg" 
            alt="Learning Illustration" 
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Right side (Form) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900">Learning Platform</h1>
            <p className="mt-2 text-sm text-gray-600">Connect, Learn, Grow</p>
          </div>
          <Outlet />
        </div>
      </div>

      {/* If login page, image after form */}
      {isLoginPage && (
        <div className="hidden lg:flex w-1/2 bg-blue-600">
          <img 
            src="/auth-side-photo.jpg" 
            alt="Learning Illustration" 
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
