import React, { useState } from 'react';

function CourseCard({ name, logo, bgColor, lessonsCompleted }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="bg-blue-50 rounded-xl p-5 mb-4 flex justify-between items-center cursor-pointer transition-all duration-300 hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02]">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex items-center justify-center ${bgColor} rounded-lg p-2`}>
          <img src={logo} alt={`${name} Logo`} className="w-full h-full object-contain" />
        </div>
        <div>
          <h3 className="text-base text-blue-500 mb-1">{name}</h3>
          <div className="text-xs text-gray-600">{lessonsCompleted}</div>
        </div>
      </div>
      <button 
        className="transition-all duration-300 hover:translate-x-2 hover:scale-125"
        onClick={handleDropdownToggle}
      >
        ▼
      </button>
    </div>
  );
}

export default CourseCard;
