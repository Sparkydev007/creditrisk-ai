import React, { useState } from 'react';

export const RiskAnalyticsView: React.FC = () => {
  const [stressScenario, setStressScenario] = useState<'baseline' | 'mild' | 'severe'>('baseline');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#0b1c30] tracking-tight">Portfolio Risk Analytics</h2>
          <p className="text-[14px] text-[#76777d] mt-1">
            Basel III capital adequacy, probability of default curves, and macro stress tests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#76777d]">Stress Scenario:</span>
          <select
            value={stressScenario}
            onChange={(e) => setStressScenario(e.target.value as any)}
            className="bg-white border border-[#c6c6cd] text-[13px] rounded px-3 py-1.5 text-[#0b1c30] focus:border-black"
          >
            <option value="baseline">Baseline Economic Model</option>
            <option value="mild">Mild Recession (+150bps Rates)</option>
            <option value="severe">Severe Stagflation (+300bps Rates)</option>
          </select>
        </div>
      </div>

      {/* 4 Risk Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Expected Loss (12m)
          </p>
          <h3 className="text-[28px] font-bold text-[#0b1c30] mt-1">
            {stressScenario === 'baseline' ? '$1.42M' : stressScenario === 'mild' ? '$2.18M' : '$4.65M'}
          </h3>
          <p className="text-[12px] text-emerald-700 mt-1 font-medium">0.82% of Total Committed</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Value at Risk (99.9% VaR)
          </p>
          <h3 className="text-[28px] font-bold text-[#0b1c30] mt-1">
            {stressScenario === 'baseline' ? '$5.80M' : stressScenario === 'mild' ? '$8.40M' : '$14.2M'}
          </h3>
          <p className="text-[12px] text-[#76777d] mt-1 font-medium">10-day holding period</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Weighted Avg PD
          </p>
          <h3 className="text-[28px] font-bold text-[#0b1c30] mt-1">
            {stressScenario === 'baseline' ? '3.4%' : stressScenario === 'mild' ? '4.8%' : '7.9%'}
          </h3>
          <p className="text-[12px] text-emerald-700 mt-1 font-medium">Investment Grade Bias</p>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded p-5 shadow-2xs">
          <p className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
            Capital Adequacy (CAR)
          </p>
          <h3 className="text-[28px] font-bold text-emerald-700 mt-1">16.8%</h3>
          <p className="text-[12px] text-emerald-700 mt-1 font-medium">Well above regulatory 10.5%</p>
        </div>
      </div>

      {/* Distribution & Sector Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs">
          <h3 className="text-[16px] font-bold text-[#0b1c30] mb-2">Score Distribution Histogram</h3>
          <p className="text-[13px] text-[#76777d] mb-4">Total active borrower distribution across credit bands.</p>
          <div className="space-y-3">
            {[
              { band: "750 - 850 (Prime)", count: 540, percentage: 42, color: "bg-emerald-600" },
              { band: "700 - 749 (Near Prime)", count: 412, percentage: 32, color: "bg-emerald-400" },
              { band: "650 - 699 (Standard)", count: 210, percentage: 16, color: "bg-amber-400" },
              { band: "600 - 649 (Sub-prime)", count: 86, percentage: 7, color: "bg-amber-600" },
              { band: "< 600 (High Risk)", count: 36, percentage: 3, color: "bg-red-600" },
            ].map((item) => (
              <div key={item.band} className="text-[13px]">
                <div className="flex justify-between font-medium mb-1">
                  <span>{item.band}</span>
                  <span className="font-mono text-[#76777d]">{item.count} apps ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Sector Concentration */}
        <div className="bg-white border border-[#e2e8f0] rounded p-6 shadow-2xs">
          <h3 className="text-[16px] font-bold text-[#0b1c30] mb-2">Sector Exposure & Risk Concentration</h3>
          <p className="text-[13px] text-[#76777d] mb-4">Monitored against single-industry policy caps (max 30%).</p>
          <div className="space-y-3">
            {[
              { sector: "Technology & Software", exposure: "$48.2M", share: 28, cap: "30% Cap" },
              { sector: "Commercial Real Estate", exposure: "$39.5M", share: 23, cap: "25% Cap" },
              { sector: "Supply Chain & Logistics", exposure: "$32.0M", share: 19, cap: "25% Cap" },
              { sector: "Healthcare & Life Sciences", exposure: "$26.4M", share: 15, cap: "20% Cap" },
              { sector: "Manufacturing & Heavy Industry", exposure: "$25.9M", share: 15, cap: "20% Cap" },
            ].map((s) => (
              <div key={s.sector} className="p-3 bg-[#f8f9ff] border border-[#e2e8f0] rounded flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[13px] text-[#0b1c30]">{s.sector}</p>
                  <p className="text-[11px] text-[#76777d]">Exposure: {s.exposure} ({s.share}%)</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Compliant ({s.cap})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
