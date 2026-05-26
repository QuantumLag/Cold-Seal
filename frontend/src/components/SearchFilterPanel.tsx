'use client'

import React, { useState } from 'react'

interface SearchFilterPanelProps {
  onSearch?: (filters: any) => void
  resultCount?: number
}

export const SearchFilterPanel: React.FC<SearchFilterPanelProps> = ({ 
  onSearch,
  resultCount = 35
}) => {
  const [filters, setFilters] = useState({
    searchProduct: '',
    sn: '',
    lotNumber: '',
    gtin: '',
    cryptoHash: '',
    shipmentDate: '',
    region: '',
    deliveryStatus: '',
    sender: '',
    receiver: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSearch = () => {
    onSearch?.(filters)
  }

  return (
    <div className="bg-white rounded-lg border border-border-light p-6 shadow-card-shadow">
      <h2 className="text-lg font-semibold text-text-primary mb-6">Search By</h2>
      
      <div className="space-y-6">
        {/* First row - Product search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Search Product
            </label>
            <input
              type="text"
              placeholder="Search Product"
              value={filters.searchProduct}
              onChange={(e) => handleInputChange('searchProduct', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              SN
            </label>
            <input
              type="text"
              placeholder="Enter SN"
              value={filters.sn}
              onChange={(e) => handleInputChange('sn', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              LOT Number
            </label>
            <input
              type="text"
              placeholder="Enter LOT Number"
              value={filters.lotNumber}
              onChange={(e) => handleInputChange('lotNumber', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              GTIN
            </label>
            <input
              type="text"
              placeholder="Enter GTIN"
              value={filters.gtin}
              onChange={(e) => handleInputChange('gtin', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              CryptoHash code
            </label>
            <input
              type="text"
              placeholder="Enter code"
              value={filters.cryptoHash}
              onChange={(e) => handleInputChange('cryptoHash', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Second row - Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Shipment Date
            </label>
            <select
              value={filters.shipmentDate}
              onChange={(e) => handleInputChange('shipmentDate', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent appearance-none bg-no-repeat bg-right"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M1 4l5 4 5-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                paddingRight: '2rem'
              }}
            >
              <option value="">Select Date</option>
              <option value="2024-01-15">2024-01-15</option>
              <option value="2024-01-20">2024-01-20</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Region
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M1 4l5 4 5-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                paddingRight: '2rem'
              }}
            >
              <option value="">Select Region</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Delivery Status
            </label>
            <select
              value={filters.deliveryStatus}
              onChange={(e) => handleInputChange('deliveryStatus', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M1 4l5 4 5-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                paddingRight: '2rem'
              }}
            >
              <option value="">Please Select</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Sender
            </label>
            <input
              type="text"
              placeholder="Enter Sender"
              value={filters.sender}
              onChange={(e) => handleInputChange('sender', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Receiver
            </label>
            <input
              type="text"
              placeholder="Enter Receiver"
              value={filters.receiver}
              onChange={(e) => handleInputChange('receiver', e.target.value)}
              className="w-full px-4 py-2 bg-bg-primary border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white font-medium rounded-lg transition-colors"
        >
          View Results
        </button>
        <span className="text-sm text-text-secondary">
          {resultCount} Results Found
        </span>
      </div>
    </div>
  )
}
