import { Activity, TrendingUp, Microscope, Target, GitCompare } from 'lucide-react';

type ActiveSection = 'overview' | 'assessment' | 'development' | 'morphology' | 'viability' | 'comparison';

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const sections = [
    { id: 'overview' as const, icon: Activity, label: 'Embryo Overview' },
    { id: 'assessment' as const, icon: Microscope, label: 'Assessment Hub' },
    { id: 'development' as const, icon: TrendingUp, label: 'Development Stage' },
    { id: 'morphology' as const, icon: Microscope, label: 'Morphology' },
    { id: 'viability' as const, icon: Target, label: 'Viability Scores' },
    { id: 'comparison' as const, icon: GitCompare, label: 'Comparison View' },
  ];

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-2">
      <div className="mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Microscope className="size-6 text-white" />
        </div>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`group relative w-14 h-14 rounded-lg flex items-center justify-center transition-all ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            title={section.label}
          >
            <Icon className="size-6" />

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
              {section.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
