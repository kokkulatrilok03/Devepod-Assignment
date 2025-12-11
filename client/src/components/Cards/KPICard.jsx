
import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const KPICard = ({ title, value, subtitle, icon, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </div>
        {icon && <div className="text-4xl">{icon}</div>}
      </div>
    </div>
  );
};

export default KPICard;

