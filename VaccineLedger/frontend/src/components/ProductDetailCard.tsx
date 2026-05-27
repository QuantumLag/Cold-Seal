'use client'

import React from 'react'

interface DetailData {
  productId: string
  productName: string
  senderDetail: {
    code: string
    name: string
    email: string
  }
  receiverDetail: {
    code: string
    name: string
    email: string
  }
  quantity: number
  collection: string
  publicKey: string
  cryptoHash: string
  timestamp: string
  temperature: string
  humidity: string
}

interface ProductDetailCardProps {
  data?: DetailData | null
}

export const ProductDetailCard: React.FC<ProductDetailCardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-border-light shadow-card-shadow p-6 h-full flex items-center justify-center">
        <p className="text-text-secondary text-sm">Select a product to view details</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-border-light shadow-card-shadow p-6 h-full overflow-y-auto">
      {/* Product Header */}
      <div className="mb-6 pb-4 border-b border-border-light">
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          #{data.productId} - {data.productName}
        </h3>
      </div>

      {/* Detail Sections */}
      <div className="space-y-6">
        {/* Sender Detail */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Sender Detail</h4>
          <div className="space-y-2 pl-3 border-l-2 border-accent-blue">
            <div>
              <p className="text-xs text-text-secondary">Code</p>
              <p className="text-sm font-medium text-text-primary">{data.senderDetail.code}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Name</p>
              <p className="text-sm font-medium text-text-primary">{data.senderDetail.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Email</p>
              <p className="text-sm text-text-primary">{data.senderDetail.email}</p>
            </div>
          </div>
        </div>

        {/* Receiver Detail */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Receiver Detail</h4>
          <div className="space-y-2 pl-3 border-l-2 border-accent-blue">
            <div>
              <p className="text-xs text-text-secondary">Code</p>
              <p className="text-sm font-medium text-text-primary">{data.receiverDetail.code}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Name</p>
              <p className="text-sm font-medium text-text-primary">{data.receiverDetail.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Email</p>
              <p className="text-sm text-text-primary">{data.receiverDetail.email}</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-primary rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">Quantity</p>
            <p className="text-lg font-semibold text-text-primary">{data.quantity}</p>
          </div>
          <div className="bg-bg-primary rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">Collection</p>
            <p className="text-lg font-semibold text-text-primary">{data.collection}</p>
          </div>
        </div>

        {/* Blockchain Data */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Blockchain Data</h4>
          <div className="space-y-3 bg-bg-primary rounded-lg p-4">
            <div>
              <p className="text-xs text-text-secondary mb-1">Public Key</p>
              <p className="text-xs font-mono text-text-primary break-all">{data.publicKey}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">CryptoHash</p>
              <p className="text-xs font-mono text-text-primary break-all">{data.cryptoHash}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Timestamp</p>
              <p className="text-xs text-text-primary">{data.timestamp}</p>
            </div>
          </div>
        </div>

        {/* Environmental Data */}
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Environmental Conditions</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-primary rounded-lg p-3">
              <p className="text-xs text-text-secondary mb-1">Temperature</p>
              <p className="text-sm font-semibold text-text-primary">{data.temperature}</p>
            </div>
            <div className="bg-bg-primary rounded-lg p-3">
              <p className="text-xs text-text-secondary mb-1">Humidity</p>
              <p className="text-sm font-semibold text-text-primary">{data.humidity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
