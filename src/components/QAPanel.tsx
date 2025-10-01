import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronUp, ChevronDown, FastForward, FileText } from 'lucide-react';

interface QAPanelProps {
  onUpdate: () => void;
}

export function QAPanel({ onUpdate }: QAPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const addEvent = (event: string) => {
    setEventLog((prev) => [event, ...prev].slice(0, 50));
  };

  const fastForward = (days: number) => {
    addEvent(`Fast-forwarded ${days} day(s)`);
    // TODO: Implement time manipulation logic
    onUpdate();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card className="mb-2 w-96 p-4 shadow-lg">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Time Manipulation</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => fastForward(1)}>
                  <FastForward className="mr-1 h-3 w-3" />
                  +1 day
                </Button>
                <Button size="sm" variant="outline" onClick={() => fastForward(3)}>
                  +3 days
                </Button>
                <Button size="sm" variant="outline" onClick={() => fastForward(7)}>
                  +7 days
                </Button>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Event Log</h3>
              <div className="max-h-48 overflow-y-auto rounded-md border bg-muted p-2 text-xs">
                {eventLog.length === 0 ? (
                  <p className="text-muted-foreground">No events yet</p>
                ) : (
                  eventLog.map((event, i) => (
                    <div key={i} className="border-b border-border py-1 last:border-0">
                      {event}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Button
        size="sm"
        variant="outline"
        className="bg-warning text-warning-foreground shadow-lg hover:bg-warning/90"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronUp className="mr-1 h-4 w-4" />}
        QA Tools
      </Button>
    </div>
  );
}
