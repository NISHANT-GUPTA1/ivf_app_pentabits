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

  const handleLogoClick = () => {
    onSectionChange('overview');
  };

  return (
      <div className="w-20 bg-white border-r border-[#E6E6E6] flex flex-col items-center py-6 gap-2">
      <div className="mb-8">
        <button 
          onClick={handleLogoClick}
          className="cursor-pointer hover:opacity-80 transition-opacity rounded-lg"
          title="Go to Embryo Overview"
        >
          <img src="/logo.jpeg" alt="EMBRYA Logo - Click to go home" className="w-10 h-10 rounded-lg object-cover" />
        </button>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`group relative w-14 h-14 rounded-lg flex items-center justify-center transition-all ${isActive
                  ? 'bg-[#FDF6F8] text-teal-medical'
                  : 'text-charcoal/40 hover:bg-blush hover:text-teal-medical'
              }`}
            title={section.label}
          >
            <Icon className="size-6" />

            {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-charcoal text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
              {section.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
