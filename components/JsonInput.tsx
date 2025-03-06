import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface JsonInputProps {
  value: string
  onChange: (value: string) => void
  onLoadSample: () => void
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  error?: string
}

export function JsonInput({
  value,
  onChange,
  onLoadSample,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  error
}: JsonInputProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Input JSON Data</CardTitle>
          <Button variant="ghost" onClick={onLoadSample} className="text-sm">
            Load Sample
          </Button>
        </div>
        <CardDescription>
          Paste your JSON data or drag & drop a JSON file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            ${error ? 'border-red-300' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          role="presentation"
        >
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="Paste your JSON data here..."
          />
          {isDragging && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center">
              <p className="text-blue-500 text-lg font-medium">Drop JSON file here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
