import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white bg-opacity-50 text-black flex justify-between items-center p-4 shadow-md fixed w-full top-0 z-50">
      <div className="flex items-center space-x-2">
        <img
          src="/meet-app.png"
          alt="Logo"
          className="h-8 w-8 rounded-[10px]"
        />
        <span className="text-xl font-semibold hidden sm:block">My Meetings</span>
      </div>

      <div className="relative">
        <img
          src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200" // Placeholder user icon
          alt="User"
          className="h-10 w-10 rounded-full border-2 border-white"
        />
      </div>
    </nav>
  );
};

export default Navbar;
