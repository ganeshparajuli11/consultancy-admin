import React, { useState } from 'react';
import { Pencil, Trash2, Globe, FileText, User, Building, Tag } from 'lucide-react';

const EntityCard  = ({
  item,
  titleKey = 'name',
  subtitleKey,
  imageKey,
  imageSize = 'medium', // 'small', 'medium', 'large'
  fallbackIcon,
  badges = [],
  fields = [],
  onEdit,
  onDelete,
  variant = 'default', // 'compact', 'detailed', 'minimal'
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const title = item[titleKey];
  const subtitle = subtitleKey ? item[subtitleKey] : null;
  const imageUrl = imageKey ? item[imageKey] : null;

  // Handle image size classes
  const getImageSizeClasses = () => {
    switch (imageSize) {
      case 'small': return 'h-20';
      case 'large': return 'h-48';
      case 'medium':
      default: return 'h-32';
    }
  };

  // Get appropriate fallback icon
  const getFallbackIcon = () => {
    if (fallbackIcon) return fallbackIcon;
    
    // Auto-detect based on common patterns
    if (imageKey === 'flag') return <Globe size={32} className="text-gray-400" />;
    if (imageKey === 'avatar' || imageKey === 'photo') return <User size={32} className="text-gray-400" />;
    if (imageKey === 'logo') return <Building size={32} className="text-gray-400" />;
    
    return <FileText size={32} className="text-gray-400" />;
  };

  // Render badge
  const renderBadge = (badge) => {
    const colors = {
      success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      warning: 'bg-amber-100 text-amber-800 border-amber-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span
        key={badge.key || badge.label}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
          colors[badge.type] || colors.default
        }`}
      >
        {badge.icon && <span className="mr-1">{badge.icon}</span>}
        {badge.label}
      </span>
    );
  };

  // Render additional fields
  const renderField = (field) => {
    const value = item[field.key];
    if (!value && !field.showEmpty) return null;

    return (
      <div key={field.key} className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{field.label}:</span>
        <span className="text-gray-900 font-semibold">
          {field.format ? field.format(value) : value || 'N/A'}
        </span>
      </div>
    );
  };

  const cardClasses = `
    relative bg-white shadow-md rounded-xl overflow-hidden group 
    hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 
    transform hover:-translate-y-2 border border-gray-100
    ${className}
  `;

  return (
    <div className={cardClasses}>
      {/* Image Section */}
      {(imageUrl && !imageError) || !imageUrl ? (
        <div className={`w-full ${getImageSizeClasses()} relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100`}>
          {imageUrl && !imageError ? (
            <div className="relative w-full h-full">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                </div>
              )}
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getFallbackIcon()}
            </div>
          )}
        </div>
      ) : null}

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Subtitle */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 line-clamp-1">{subtitle}</p>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {badges.map(renderBadge)}
          </div>
        )}

        {/* Additional Fields */}
        {fields.length > 0 && (
          <div className="space-y-2 mb-3">
            {fields.map(renderField)}
          </div>
        )}

        {/* Status Indicator */}
        {item.isActive !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Status:</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${item.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-semibold ${item.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hover Actions Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="flex space-x-3">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="flex items-center space-x-2 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-all duration-200 font-medium"
            >
              <Pencil size={16} />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="flex items-center space-x-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transform hover:scale-105 transition-all duration-200 font-medium"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};


export default EntityCard