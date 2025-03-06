import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface ConversionPanelProps {
  onExport: () => void
  isLoading: boolean
  disabled: boolean
  error?: string
  success?: boolean
}

export function ConversionPanel({
  onExport,
  isLoading,
  disabled,
  error,
  success
}: ConversionPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Convert to CSV</CardTitle>
        <CardDescription>
          Transform your JSON data into CSV format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={onExport}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            'Export to CSV'
          )}
        </Button>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="h-5 w-5" />
            <p className="text-sm">CSV exported successfully!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
