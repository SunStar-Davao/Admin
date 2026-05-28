import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = '#1f2937', 
  subtitle, 
  trend, 
  trendUp = true,
  percentage,
  format = 'number',
  onClick,
  className = ''
}) => {
  
  // Format value based on type
  const formattedValue = () => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-PH', { 
        style: 'currency', 
        currency: 'PHP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    if (format === 'percentage') {
      return `${value}%`;
    }
    if (format === 'time') {
      return value;
    }
    return value.toLocaleString();
  };

  return (
    <div 
      className={`bg-white border border-gray-200 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Left side - Title and Value */}
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              {title}
            </p>
            
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-gray-900">
                {formattedValue()}
              </p>
              
              {/* Percentage badge */}
              {percentage !== undefined && (
                <span className={`text-xs font-medium px-1.5 py-0.5 ${
                  percentage >= 0 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {percentage > 0 ? '+' : ''}{percentage}%
                </span>
              )}
            </div>

            {/* Subtitle or additional info */}
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right side - Icon */}
          <div className="flex-shrink-0 ml-4">
            {Icon && (
              <div className="p-1.5 bg-gray-100">
                <Icon size="18" className="text-gray-600" />
              </div>
            )}
          </div>
        </div>

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {trendUp ? (
                <TrendingUp size="12" className="text-green-600" />
              ) : (
                <TrendingDown size="12" className="text-red-600" />
              )}
              <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            </div>
            <span className="text-xs text-gray-400">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;