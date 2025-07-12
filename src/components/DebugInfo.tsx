import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, CheckCircle, XCircle } from 'lucide-react';

export const DebugInfo: React.FC = () => {
  const [showDebug, setShowDebug] = React.useState(false);

  const environmentVars = {
    'VITE_SUPABASE_URL': (import.meta as any).env?.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': (import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
    'VITE_PESAPAL_CONSUMER_KEY': (import.meta as any).env?.VITE_PESAPAL_CONSUMER_KEY,
    'VITE_PESAPAL_CONSUMER_SECRET': (import.meta as any).env?.VITE_PESAPAL_CONSUMER_SECRET,
    'VITE_PESAPAL_ENVIRONMENT': (import.meta as any).env?.VITE_PESAPAL_ENVIRONMENT,
    'VITE_MODE': (import.meta as any).env?.MODE,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (value: string | undefined) => {
    return value ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowDebug(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          Debug Info
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Environment Debug Info</span>
            <Button
              onClick={() => setShowDebug(false)}
              variant="ghost"
              size="sm"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Environment Variables:</h3>
            {Object.entries(environmentVars).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="font-mono text-sm">{key}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(value)}
                  <span className="text-sm">
                    {value ? 'Set' : 'Not Set'}
                  </span>
                  {value && (
                    <Button
                      onClick={() => copyToClipboard(value)}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Current Environment:</h3>
            <div className="p-2 bg-muted rounded">
              <span className="font-mono text-sm">
                {(import.meta as any).env?.MODE || 'development'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Payment Mode:</h3>
            <div className="p-2 bg-muted rounded">
              <span className="font-mono text-sm">
                {(import.meta as any).env?.MODE === 'development' ? 'Simulation' : 'Live API'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Troubleshooting:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• If "Not Set" appears, add the variable to your environment</li>
              <li>• For Netlify, add variables in Site Settings &gt; Environment Variables</li>
              <li>• For local development, create a .env file</li>
              <li>• Check browser console for detailed error messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 