import { useState } from 'react';
import { Button } from '../ui/Button';

export default function CounterReferralForm({ referralId }: { referralId: string }) {
  const [outcome, setOutcome] = useState('');
  const [instructions, setInstructions] = useState('');
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to counter-referral endpoint
    console.log('Submitting Counter Referral:', { referralId, outcome, instructions, requiresFollowUp, followUpDate });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl bg-card p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 border-b pb-2">Create Counter-Referral</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Clinical Outcome</label>
          <textarea 
            className="w-full border rounded-md p-2 bg-background" 
            rows={2} 
            value={outcome}
            onChange={e => setOutcome(e.target.value)}
            placeholder="Diagnosis and outcome of the consultation..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">ASHA Worker Instructions (Vernacular safe)</label>
          <textarea 
            className="w-full border rounded-md p-2 bg-background" 
            rows={3}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Clear, simple instructions for the health worker to execute in the village..."
            required
          />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input 
            type="checkbox" 
            id="followup"
            checked={requiresFollowUp}
            onChange={e => setRequiresFollowUp(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="followup" className="text-sm font-medium">Require physical follow-up by ASHA worker</label>
        </div>

        {requiresFollowUp && (
          <div>
            <label className="block text-sm font-medium mb-1 mt-2">Follow-up Date</label>
            <input 
              type="date" 
              className="border rounded-md p-2 bg-background"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              required
            />
          </div>
        )}

        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit">Submit Counter-Referral & Close Loop</Button>
        </div>
      </div>
    </form>
  );
}
