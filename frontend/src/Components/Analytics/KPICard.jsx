import React from 'react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue, className = "" }) => {

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  // const getTrendIcon = (trend) => {
  //   if (trend === 'up') return '↗';
  //   if (trend === 'down') return '↘';
  //   return '→';
  // };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↑';    
    if (trend === 'down') return '↓';   
    return '→';                        
  };


  return (
    <div className={`rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all bg-white duration-200 min-h-[162px] ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-custom-blue mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${getTrendColor(trend)}`}>
              <span className="mr-1">{getTrendIcon(trend)}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-custom-blue" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;