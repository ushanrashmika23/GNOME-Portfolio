import { User, MapPin, Briefcase } from 'lucide-react';
import me from "./../../img/me.png";

interface WelcomeWindowProps {
  theme: 'dark' | 'light';
}

export default function WelcomeWindow({ theme }: WelcomeWindowProps) {
  return (
    <div className="w-full max-w-[500px] sm:w-[500px] p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${theme === 'dark' ? 'bg-[#3584e4]' : 'bg-[#3584e4]'
          } flex items-center justify-center flex-shrink-0`}>
          {/* <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" /> */}
          <img src={me} alt="Ushan Rashmika" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
        </div>

        <div className="flex-1">
          <h1 className={`text-xl sm:text-2xl mb-2 font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            Ushan Rashmika
          </h1>
          <p className={`font-['JetBrains_Mono'] text-xs sm:text-sm mb-3 sm:mb-4 ${theme === 'dark' ? 'text-[#3584e4]' : 'text-[#3584e4]'
            }`}>
            Full-Stack Developer
          </p>

          <div className={`flex flex-col gap-2 text-xs sm:text-sm font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'
            }`}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Based in Sri Lanka</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Open to opportunities</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`space-y-4 font-['JetBrains_Mono'] text-sm ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'
        }`}>
        <p>
          &nbsp;Hey there! I'm a passionate full-stack developer who loves building elegant solutions
          to complex problems. I specialize in modern web technologies and have a keen eye for
          user experience.
        </p>

        <p>
          My journey in software development has led me through various exciting projects,
          from responsive web applications to scalable backend systems. I believe in writing
          clean, maintainable code and staying updated with the latest industry trends.
        </p>

        <p>
          When I'm not coding, you can find me exploring new technologies, contributing to
          open-source projects, or sharing knowledge with the developer community.
        </p>
      </div>

      <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
        }`}>
        <p className={`text-xs font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'
          }`}>
          💡 Tip: Drag windows around to arrange your workspace
        </p>
      </div>

    </div>
  );
}