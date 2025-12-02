import { Code2, Database, Boxes, Wrench } from 'lucide-react';

interface SkillsWindowProps {
  theme: 'dark' | 'light';
}

const skillCategories = [
  {
    id: 1,
    title: 'Frontend',
    icon: Code2,
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Angular', 'CSS','TailwindCSS'],
    color: '#3584e4',
  },
  {
    id: 2,
    title: 'Backend',
    icon: Boxes,
    skills: ['Node.js', 'Java','Spring Boot','Python', 'ExpressJs'],
    color: '#33d17a',
  },
  {
    id: 3,
    title: 'Databases',
    icon: Database,
    skills: ['PostgreSQL', 'MongoDB', 'MySQL'],
    color: '#f6d32d',
  },
  {
    id: 4,
    title: 'Tools & Others',
    icon: Wrench,
    skills: ['Git', 'Docker', 'Linux', 'AWS', 'CI/CD', 'Figma'],
    color: '#e01b24',
  },
];

export default function SkillsWindow({ theme }: SkillsWindowProps) {
  return (
    <div className="w-full max-w-[600px] sm:w-[600px] p-4 sm:p-8">
      <h2 className={`text-lg sm:text-xl mb-4 sm:mb-6 font-['JetBrains_Mono'] ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Skills & Technologies
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {skillCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className={`p-5 rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className={`font-['JetBrains_Mono'] ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] transition-all ${
                      theme === 'dark'
                        ? 'bg-white/10 text-white/80 hover:bg-white/15'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-6 p-4 rounded-lg border ${
        theme === 'dark'
          ? 'bg-[#3584e4]/10 border-[#3584e4]/20'
          : 'bg-[#3584e4]/10 border-[#3584e4]/20'
      }`}>
        <p className={`text-xs font-['JetBrains_Mono'] ${
          theme === 'dark' ? 'text-[#3584e4]' : 'text-[#2f73c5]'
        }`}>
          💼 Continuously learning and expanding my tech stack
        </p>
      </div>
    </div>
  );
}