"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartProps {
  title: string
  data: Array<{ label: string; value: number; color?: string }>
  type?: 'bar' | 'line' | 'pie'
  height?: number
}

export function Chart({ title, data, type = 'bar', height = 200 }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" style={{ height }}>
          {type === 'bar' && (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600 truncate">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color || '#f97316'
                      }}
                    />
                  </div>
                  <div className="w-16 text-sm font-semibold text-right">
                    {typeof item.value === 'number' && item.value % 1 === 0 
                      ? item.value 
                      : item.value.toFixed(2)
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {type === 'line' && (
            <div className="relative" style={{ height: height - 40 }}>
              <svg width="100%" height="100%" className="absolute inset-0">
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  points={data.map((item, index) => 
                    `${(index / (data.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
                  ).join(' ')}
                />
                {data.map((item, index) => (
                  <circle
                    key={index}
                    cx={`${(index / (data.length - 1)) * 100}%`}
                    cy={`${100 - (item.value / maxValue) * 100}%`}
                    r="4"
                    fill="#f97316"
                  />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                {data.map((item, index) => (
                  <span key={index} className="transform -rotate-45 origin-left">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {type === 'pie' && (
            <div className="flex items-center justify-center" style={{ height: height - 40 }}>
              <div className="relative w-32 h-32">
                <svg width="100%" height="100%" className="transform -rotate-90">
                  {data.map((item, index) => {
                    const total = data.reduce((sum, d) => sum + d.value, 0)
                    const percentage = (item.value / total) * 100
                    const previousPercentages = data
                      .slice(0, index)
                      .reduce((sum, d) => sum + (d.value / total) * 100, 0)
                    
                    const startAngle = (previousPercentages / 100) * 360
                    const endAngle = ((previousPercentages + percentage) / 100) * 360
                    
                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)
                    
                    const largeArcFlag = percentage > 50 ? 1 : 0
                    
                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={item.color || `hsl(${(index * 60) % 360}, 70%, 50%)`}
                      />
                    )
                  })}
                </svg>
              </div>
              <div className="ml-6 space-y-2">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color || `hsl(${(index * 60) % 360}, 70%, 50%)` }}
                    />
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
