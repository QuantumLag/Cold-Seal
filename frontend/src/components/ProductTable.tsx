'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  shipmentDate: string
  lot: string
  sender: string
  receiver: string
  status: 'delivered' | 'pending' | 'in-transit'
}

interface ProductTableProps {
  onSelectRow?: (product: Product) => void
  selectedId?: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    shipmentDate: '19 Jan 2017',
    lot: '72608',
    sender: 'Sender Name',
    receiver: 'Receiver Name',
    status: 'pending',
  },
  {
    id: '2',
    shipmentDate: '11 Jan 2017',
    lot: '72608',
    sender: 'Dummy Sender',
    receiver: 'Dummy Receiver',
    status: 'delivered',
  },
  {
    id: '3',
    shipmentDate: '19 Jan 2017',
    lot: '72608',
    sender: 'Sender Name',
    receiver: 'Receiver Name',
    status: 'pending',
  },
  {
    id: '4',
    shipmentDate: '11 Jan 2017',
    lot: '72608',
    sender: 'Dummy Sender',
    receiver: 'Dummy Receiver',
    status: 'delivered',
  },
  {
    id: '5',
    shipmentDate: '19 Jan 2017',
    lot: '72608',
    sender: 'Sender Name',
    receiver: 'Receiver Name',
    status: 'pending',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return {
        badge: 'bg-status-success',
        text: 'text-status-success-text',
        label: 'DELIVERED',
      }
    case 'pending':
      return {
        badge: 'bg-status-warning',
        text: 'text-status-warning-text',
        label: 'DISPATCH',
      }
    case 'in-transit':
      return {
        badge: 'bg-status-warning',
        text: 'text-status-warning-text',
        label: 'IN TRANSIT',
      }
    default:
      return {
        badge: 'bg-gray-100',
        text: 'text-gray-600',
        label: 'UNKNOWN',
      }
  }
}

export const ProductTable: React.FC<ProductTableProps> = ({ 
  onSelectRow,
  selectedId
}) => {
  return (
    <div className="bg-white rounded-lg border border-border-light shadow-card-shadow overflow-hidden">
      {/* Table header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-light bg-bg-primary">
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Shipment Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                LOT
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Sender
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Receiver
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product, index) => {
              const statusInfo = getStatusColor(product.status)
              const isSelected = selectedId === product.id
              
              return (
                <tr
                  key={product.id}
                  onClick={() => onSelectRow?.(product)}
                  className={cn(
                    'border-b border-border-light cursor-pointer transition-colors',
                    index % 2 === 0 ? 'bg-white' : 'bg-bg-primary/30',
                    isSelected ? 'bg-accent-blue/5 border-l-4 border-l-accent-blue' : 'hover:bg-bg-primary/50'
                  )}
                >
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {product.shipmentDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary font-medium">
                    {product.lot}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {product.sender}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-primary">
                    {product.receiver}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                      statusInfo.badge,
                      statusInfo.text
                    )}>
                      {statusInfo.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
