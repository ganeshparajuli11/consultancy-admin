import React from 'react';

const Card = ({
  icon,
  title,
  value,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-4 ${className}`}>
      {children ? (
        // if you passed children, render them (e.g. chart wrapper)
        children
      ) : (
        // otherwise fall back to icon / title / value
        <div className="flex items-center">
          {icon && (
            <div className="p-3 bg-indigo-50 rounded-full">
              {icon}
            </div>
          )}
          <div className="ml-4">
            {title && (
              <p className="text-gray-500 text-sm">{title}</p>
            )}
            {value && (
              <p className="text-2xl font-semibold text-gray-800">
                {value}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
