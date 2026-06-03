import type { GameRequirement } from '@/types/database';
import { Monitor, Cpu, MemoryStick, HardDrive } from 'lucide-react';

interface SystemRequirementsProps {
  requirements: GameRequirement[];
}

function RequirementItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
      <div>
        <span className="text-xs font-semibold text-gray-400 uppercase">{label}: </span>
        <span className="text-sm text-gray-300">{value}</span>
      </div>
    </div>
  );
}

export default function SystemRequirements({ requirements }: SystemRequirementsProps) {
  const minimum = requirements.find(r => r.type === 'minimum');
  const recommended = requirements.find(r => r.type === 'recommended');

  if (!minimum && !recommended) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {minimum && (
        <div className="p-5 bg-white/3 border border-white/8 rounded-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" /> Minimum
          </h3>
          <div className="space-y-3">
            <RequirementItem icon={Monitor} label="OS" value={minimum.os} />
            <RequirementItem icon={Cpu} label="Processor" value={minimum.processor} />
            <RequirementItem icon={MemoryStick} label="Memory" value={minimum.memory} />
            <RequirementItem icon={Monitor} label="Graphics" value={minimum.graphics} />
            <RequirementItem icon={HardDrive} label="Storage" value={minimum.storage} />
          </div>
        </div>
      )}
      {recommended && (
        <div className="p-5 bg-white/3 border border-white/8 rounded-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" /> Recommended
          </h3>
          <div className="space-y-3">
            <RequirementItem icon={Monitor} label="OS" value={recommended.os} />
            <RequirementItem icon={Cpu} label="Processor" value={recommended.processor} />
            <RequirementItem icon={MemoryStick} label="Memory" value={recommended.memory} />
            <RequirementItem icon={Monitor} label="Graphics" value={recommended.graphics} />
            <RequirementItem icon={HardDrive} label="Storage" value={recommended.storage} />
          </div>
        </div>
      )}
    </div>
  );
}
