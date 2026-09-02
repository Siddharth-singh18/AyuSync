
import { Button } from '../ui/Button';

export default function LiveQueue() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow col-span-2">
      <div className="p-6 pb-2 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Live Doctor Queue
        </h3>
      </div>
      <div className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Patient</th>
              <th className="px-4 py-2 font-medium">Triage</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Wait Time</th>
              <th className="px-4 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3">Rahul Kumar (42/M)</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-bold rounded">URGENT</span>
              </td>
              <td className="px-4 py-3 font-medium">WAITING</td>
              <td className="px-4 py-3 text-muted-foreground">14 mins</td>
              <td className="px-4 py-3 text-right">
                <Button size="sm">Start Consult</Button>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3">Sita Devi (38/F)</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">ROUTINE</span>
              </td>
              <td className="px-4 py-3 font-medium text-muted-foreground">IN DIAGNOSTICS</td>
              <td className="px-4 py-3 text-muted-foreground">-</td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="outline">View Status</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
