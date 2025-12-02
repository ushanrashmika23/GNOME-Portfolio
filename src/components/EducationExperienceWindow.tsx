import { GraduationCap, Briefcase, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

interface EducationExperienceWindowProps {
    theme: 'dark' | 'light';
}

const educationData = [
    {
        id: 1,
        degree: 'BSc (Hons) in Software Engineering',
        institution: 'General Sir John Kotelawala Defence University',
        location: 'Colombo, SL',
        period: '2025 - present',
        description: 'Specialized in Software Engineering. Thesis on Machine Learning Applications in Fullstack Development.',
        gpa: '',
        achievements: ['']
    },
    {
        id: 2,
        degree: 'Full-Stack Master Diploma',
        institution: 'Developer Stacks Academy',
        location: 'Colombo, SL',
        period: '2024 - 2025',
        description: 'Comprehensive study in Enterprise Systems, programming, and software development methodologies.',
        gpa: '',
        achievements: []
    },
    {
        id: 3,
        degree: 'CCNA: Introduction to Networks',
        institution: 'Cisco Networking Academy',
        location: 'San Francisco, USA',
        period: '2025',
        description: 'Fundamentals of networking, including network protocols, IP addressing, and network security.',
        gpa: '',
        achievements: []
    }
    ,
    {
        id: 4,
        degree: 'Network Technician Career Path',
        institution: 'Cisco Networking Academy',
        location: 'San Francisco, USA',
        period: '2025',
        description: 'In-depth knowledge of network infrastructure, troubleshooting, and maintenance.',
        gpa: '',
        achievements: []
    }
    ,
    {
        id: 5,
        degree: 'Ethical Hacker',
        institution: 'Cisco Networking Academy',
        location: 'San Francisco, USA',
        period: '2025',
        description: 'Comprehensive understanding of ethical hacking techniques, penetration testing, and cybersecurity principles.',
        gpa: '',
        achievements: []
    }
    ,
    {
        id: 5,
        degree: 'Multi Cloud Network Associate',
        institution: 'Aviatrix',
        location: 'Santa Clara, USA',
        period: '2025',
        description: 'Focused on multi-cloud networking concepts, cloud security, and network automation across various cloud platforms.',
        gpa: '',
        achievements: []
    }
];

const experienceData = [
    {
        id: 1,
        position: 'Founder & Lead Developer',
        company: 'Rusoft ltd.',
        location: 'Colombo, SL',
        period: '2024 - present',
        description: 'Leading a software development startup focused on delivering innovative web solutions.',
        responsibilities: [
            'Founded and managed a software development company specializing in web applications',
            'Oversaw project management, client relations, and business development',
            'Implemented agile methodologies to streamline development processes'
        ],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Angular', 'Node.js', 'Spring Boot', 'Sass', 'Figma']
    },
    {
        id: 2,
        position: 'Full-Stack Developer',
        company: 'Upwork',
        location: 'Remote',
        period: '2024 - present',
        description: 'Providing end-to-end web development services to clients on the Upwork platform.',
        responsibilities: [
            'Built scalable web applications using MERN stack technologies',
            'Integrated third-party APIs to enhance application functionality',
            'Conducted code reviews and implemented best practices for code quality',
            'Managed deployment and monitoring of applications on cloud platforms'
        ],
        technologies: ['Spring Boot', 'Node.js', 'Express.js', 'MongoDB', 'React', 'Angular']
    },
    {
        id: 3,
        position: 'Full-Stack Developer',
        company: 'Fiverr',
        location: 'Remote',
        period: '2024 - Present',
        description: 'Delivering full-stack development solutions for diverse clients on the Fiverr platform.',
        responsibilities: [
            'Developed and maintained web applications using React, Node.js, and AWS',
            'Collaborated with clients to gather requirements and deliver tailored solutions',
            'Implemented responsive designs ensuring cross-device compatibility',
            'Optimized application performance leading to a 30% reduction in load times'
        ],
        technologies: ['React', 'Node.js', 'AWS', 'MongoDB', 'Docker', 'TypeScript', 'MYSQL', 'Angular', 'Spring Boot']
    },

];

export default function EducationExperienceWindow({ theme }: EducationExperienceWindowProps) {
    const [activeTab, setActiveTab] = useState<'education' | 'experience'>('education');

    return (
        <div className="w-[750px] max-w-[750px] min-w-[750px] p-4 sm:p-6 overflow-hidden">
            {/* Tab Navigation */}
            <div className={`flex border-b mb-6 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                }`}>
                <button
                    onClick={() => setActiveTab('education')}
                    className={`flex items-center gap-2 px-4 py-3 font-['JetBrains_Mono'] text-sm transition-all`}
                    style={{
                        color: activeTab === 'education'
                            ? theme === 'dark' ? '#3584e4' : '#2f73c5'
                            : theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgb(107,114,128)',
                        borderBottom: activeTab === 'education' 
                            ? `2px solid ${theme === 'dark' ? '#3584e4' : '#2f73c5'}`
                            : 'none'
                    }}
                >
                    <GraduationCap className="w-4 h-4" />
                    Education
                </button>
                <button
                    onClick={() => setActiveTab('experience')}
                    className={`flex items-center gap-2 px-4 py-3 font-['JetBrains_Mono'] text-sm transition-all`}
                    style={{
                        color: activeTab === 'experience'
                            ? theme === 'dark' ? '#33d17a' : '#2d7a3d'
                            : theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgb(107,114,128)',
                        borderBottom: activeTab === 'experience' 
                            ? `2px solid ${theme === 'dark' ? '#33d17a' : '#2d7a3d'}`
                            : 'none'
                    }}
                >
                    <Briefcase className="w-4 h-4" />
                    Experience
                </button>
            </div>

            {/* Education Tab */}
            {activeTab === 'education' && (
                <div className="space-y-6 min-h-[600px] w-full max-w-[700px]">
                    <h2 className={`text-lg sm:text-xl mb-4 font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        Educational Background
                    </h2>

                    {educationData.map((edu) => (
                        <div
                            key={edu.id}
                            className={`p-5 rounded-lg border transition-all mb-4 ${theme === 'dark'
                                ? 'bg-white/5 border-white/10 hover:border-white/20'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#3584e4]"
                                >
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1">
                                    <h3 className={`font-['JetBrains_Mono'] text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {edu.degree}
                                    </h3>

                                    <div className={`text-sm font-['JetBrains_Mono'] mb-2 ${theme === 'dark' ? 'text-[#3584e4]' : 'text-[#2f73c5]'
                                        }`}>
                                        {edu.institution}
                                    </div>

                                    <div className={`flex items-center gap-4 text-xs font-['JetBrains_Mono'] mb-3 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                                        }`}>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {edu.period}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {edu.location}
                                        </div>
                                        <div>GPA: {edu.gpa}</div>
                                    </div>

                                    <p className={`text-sm font-['JetBrains_Mono'] mb-3 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                                        }`}>
                                        {edu.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {edu.achievements.map((achievement, index) => (
                                            <span
                                                key={index}
                                                className={`text-xs px-2 py-1 rounded font-['JetBrains_Mono'] ${theme === 'dark'
                                                    ? 'bg-[#33d17a]/20 text-[#33d17a]'
                                                    : 'bg-[#33d17a]/20 text-[#2d7a3d]'
                                                    }`}
                                            >
                                                {achievement}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
                <div className="space-y-6 min-h-[600px] w-full max-w-[700px]">
                    <h2 className={`text-lg sm:text-xl mb-4 font-['JetBrains_Mono'] ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        Work Experience
                    </h2>

                    {experienceData.map((exp) => (
                        <div
                            key={exp.id}
                            className={`p-5 rounded-lg border transition-all mb-4 ${theme === 'dark'
                                ? 'bg-white/5 border-white/10 hover:border-white/20'
                                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: '#33d17a' }}
                                >
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1">
                                    <h3 className={`font-['JetBrains_Mono'] text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        {exp.position}
                                    </h3>

                                    <div
                                        className="text-sm font-['JetBrains_Mono'] mb-2"
                                        style={{
                                            color: theme === 'dark' ? '#33d17a' : '#2d7a3d',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {exp.company}
                                    </div>

                                    <div className={`flex items-center gap-4 text-xs font-['JetBrains_Mono'] mb-3 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                                        }`}>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {exp.period}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {exp.location}
                                        </div>
                                    </div>

                                    <p className={`text-sm font-['JetBrains_Mono'] mb-3 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                                        }`}>
                                        {exp.description}
                                    </p>

                                    <div className="mb-3">
                                        <h4 className={`text-sm font-['JetBrains_Mono'] mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                                            }`}>
                                            Key Responsibilities:
                                        </h4>
                                        <ul className={`text-xs font-['JetBrains_Mono'] space-y-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                                            }`}>
                                            {exp.responsibilities.map((resp, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-[#33d17a] mt-1">•</span>
                                                    {resp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {exp.technologies.map((tech, index) => (
                                            <span
                                                key={index}
                                                className="text-xs px-2 py-1 rounded font-['JetBrains_Mono']"
                                                style={{
                                                    // backgroundColor: 'rgba(51, 209, 122, 0.2)',
                                                    color: theme === 'dark' ? '#33d17a' : '#2d7a3d'
                                                }}
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}