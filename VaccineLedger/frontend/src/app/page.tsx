'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { SearchFilterPanel } from '@/components/SearchFilterPanel'
import { ProductTable } from '@/components/ProductTable'
import { ProductDetailCard } from '@/components/ProductDetailCard'
import { mockSystemStatus } from '@/data/mockData'

interface Product {
  id: string
  shipmentDate: string
  lot: string
  sender: string
  receiver: string
  status: 'delivered' | 'pending' | 'in-transit'
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [systemStatus] = useState(mockSystemStatus)

  // Mock detail data
  const detailData = selectedProduct ? {
    productId: selectedProduct.id,
    productName: 'Dummy Product Name',
    senderDetail: {
      code: '#HYU4&E1',
      name: 'Dummy Sender Name',
      email: 'sender@dummyemail.com',
    },
    receiverDetail: {
      code: '#HYU4&E1',
      name: 'Dummy Receiver Name',
      email: 'receiver@dummyemail.com',
    },
    quantity: 12,
    collection: 'Scheduled',
    publicKey: '0BSUTE123',
    cryptoHash: 'abc123def456ghi789',
    timestamp: new Date().toISOString(),
    temperature: '2-8°C',
    humidity: '45-65%',
  } : null

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top bar */}
        <TopBar status={systemStatus} />

        {/* Workspace */}
        <main className="flex-1 overflow-auto bg-bg-primary">
          <div className="p-6 max-w-full">
            {/* Page title */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Product Tracking</h1>
            </div>

            {/* Filter Panel */}
            <div className="mb-6">
              <SearchFilterPanel resultCount={35} />
            </div>

            {/* Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Data Table (65-70% width) */}
              <div className="lg:col-span-2">
                <ProductTable 
                  onSelectRow={setSelectedProduct}
                  selectedId={selectedProduct?.id}
                />
              </div>

              {/* Right: Detail Card (30-35% width) */}
              <div className="lg:col-span-1">
                <ProductDetailCard data={detailData} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
