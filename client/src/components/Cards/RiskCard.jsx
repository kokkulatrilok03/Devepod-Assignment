
import React from 'react';
import { getRiskColor } from '../../utils/helpers';

const RiskCard = ({ projectName, riskScore, riskLevel, riskFactors }) => {
  const colorClass = getRiskColor(riskLevel);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{projectName}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
          {riskLevel}
        </span>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Risk Score</span>
          <span className="text-2xl font-bold text-gray-900">{riskScore}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              riskScore >= 80 ? 'bg-red-600' :
              riskScore >= 60 ? 'bg-orange-600' :
              riskScore >= 30 ? 'bg-yellow-600' : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(riskScore, 100)}%` }}
          />
        </div>
      </div>
      {riskFactors && riskFactors.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Risk Factors:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {riskFactors.slice(0, 3).map((factor, index) => (
              <li key={index}>{factor.message || factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskCard;

