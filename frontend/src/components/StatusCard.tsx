import { CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import type { ToolStatus } from '../types';

interface StatusCardProps {
  status: ToolStatus;
}

function StatusCard({ status }: StatusCardProps) {
  const LeadingIcon = status.icon === 'shield' ? ShieldCheck : Search;

  return (
    <div className="flex h-[58px] items-center gap-4 rounded-md border border-slate-300 bg-white px-4 text-base shadow-sm">
      <LeadingIcon className="text-primary-600" size={25} />
      <span className="flex-1">
        Tool: {status.tool} {status.status}
      </span>
      <CheckCircle2 className="text-primary-600" size={24} />
    </div>
  );
}

export default StatusCard;
