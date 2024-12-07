import { useState } from 'react'
import './PodInfo.scss'
import { TeamModal } from '../../../component/PodInfo/TeamModal'
import { PodCard } from '../../../component/PodInfo/PodCard'
import { sortTeamMembers } from '../../../contexts/sortTeamMembers'
import { SearchBar } from '../../../component/PodInfo/SearchBar'
import { FaSearch} from "react-icons/fa";
const teamMembers = [
  {
    id: 1,
    name: "Lola Meyers",
    email: "lola.m@company.com",
    jobTitle: "Project Manager",
    experience: 5,
    description: "Experienced PM leading product strategy and innovation.",
    imageUrl: "https://picsum.photos/400/300?random=1",
    pods: ["Avengers Pod", "Business Development Pod"],
    skills: { "Product Management": 3, "Agile": 5, "User Research": 2 },
    isActive: true
  },
  {
    id: 2,
    name: "Owen Garcia",
    email: "owen.g@company.com",
    jobTitle: "Senior Developer",
    experience: 7,
    description: "Frontend expert specializing in React and Next.js.",
    imageUrl: "https://picsum.photos/400/300?random=2",
    pods: ["Dev Squad Pod", "Algo Pod"],
    skills: { "React": 10, "Next.js": 8, "TypeScript": 6 },
    isActive: false
  },
  {
    id: 3,
    name: "Caitlyn King",
    email: "caitlyn.k@company.com",
    jobTitle: "Team Lead",
    experience: 8,
    description: "Design team lead with extensive UI/UX experience.",
    imageUrl: "https://picsum.photos/400/300?random=3",
    pods: ["Avengers Pod"],
    skills: { "UI Design": 12, "UX Design": 10, "Figma": 8 },
    isActive: true
  },
  {
    id: 4,
    name: "Ashwin Santiago",
    email: "ashwin.s@company.com",
    jobTitle: "Assistant Technical Manager",
    experience: 10,
    description: "Experienced engineering leader from top tech companies.",
    imageUrl: "https://picsum.photos/400/300?random=4",
    pods: ["Dev Squad Pod"],
    skills: { "Team Leadership": 10, "Agile": 8, "System Architecture": 7 },
    isActive: true
  },
  {
    id: 5,
    name: "Ashwin Santiago",
    email: "ashwin.s@company.com",
    jobTitle: "Assistant Technical Manager",
    experience: 10,
    description: "Experienced engineering leader from top tech companies.",
    imageUrl: "https://picsum.photos/400/300?random=5",
    pods: ["Dev Squad Pod"],
    skills: { "Team Leadership": 10, "Agile": 8, "System Architecture": 7 },
    isActive: true
  },
  {
    id: 6,
    name: "Ashwin Santiago",
    email: "ashwin.s@company.com",
    jobTitle: "Assistant Technical Manager",
    experience: 1,
    description: "Experienced engineering leader from top tech companies.",
    imageUrl: "https://picsum.photos/400/300?random=6",
    pods: ["Dev Squad Pod"],
    skills: { "Team Leadership": 10, "Agile": 8, "System Architecture": 7 },
    isActive: true
  },
  {
    id: 7,
    name: "Ashwin Santiago",
    email: "ashwin.s@company.com",
    jobTitle: "Assistant Technical Manager",
    experience: 8,
    description: "Experienced engineering leader from top tech companies.",
    imageUrl: "https://picsum.photos/400/300?random=7",
    pods: ["Dev Squad Pod"],
    skills: { "Team Leadership": 10, "Agile": 8, "System Architecture": 7 },
    isActive: true
  },
  {
    id: 8,
    name: "Sienna Hewitt",
    email: "sienna.h@company.com",
    jobTitle: "Assistant Manager",
    experience: 2,
    description: "Seasoned leader with startup and enterprise experience.",
    imageUrl: "https://picsum.photos/400/300?random=8",
    pods: ["Business Development Pod"],
    skills: { "Strategy": 15, "Fundraising": 10, "Team Building": 12 },
    isActive: true
  },
  {
    id: 9,
    name: "Kyla Choi",
    email: "kyla.c@company.com",
    jobTitle: "Developer",
    experience: 3,
    description: "UX specialist focusing on user research and testing.",
    imageUrl: "https://picsum.photos/400/300?random=9",
    pods: ["Avengers Pod"],
    skills: { "User Research": 5, "Usability Testing": 4, "Data Analysis": 3 },
    isActive: false
  }
]

const projects = [
  {
    id: 1,
    name: "Project Alpha",
    description: "Developing a new AI-powered chatbot for customer support",
    status: "In Progress",
    techStack: ["React", "Node.js", "Machine Learning"],
    imageUrl: "https://picsum.photos/300/200?random=11",
    podName: "Avengers Pod",
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 2,
    name: "Project Beta",
    description: "Redesigning the company's main dashboard for better UX",
    status: "In Progress",
    techStack: ["Vue.js", "SCSS", "Figma"],
    imageUrl: "https://picsum.photos/300/200?random=15",
    podName: "Avengers Pod",
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 3,
    name: "Project Gamma",
    description: "Implementing a new microservices architecture",
    status: "Pending",
    techStack: ["Kubernetes", "Docker", "Spring Boot"],
    imageUrl: "https://picsum.photos/300/200?random=14",
    podName: "Dev Squad Pod",
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 4,
    name: "Project Delta",
    description: "Optimizing database queries for improved performance",
    status: "Completed",
    techStack: ["PostgreSQL", "Redis", "AWS"],
    imageUrl: "https://picsum.photos/300/200?random=13",
    podName: "Algo Pod",
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 5,
    name: "Project Epsilon",
    description: "Developing a new sales strategy for Q4",
    status: "In Progress",
    techStack: ["Excel", "Power BI", "SQL"],
    imageUrl: "https://picsum.photos/300/200?random=12",
    podName: "Business Development Pod",
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
];


const pods = [
  {
    name: "Avengers Pod",
    description: "Core product development and innovation team",
    active: 9,
    notactive: 2,
    members: sortTeamMembers(teamMembers.filter(member => member.pods.includes("Avengers Pod"))),
    projects: projects.filter(project => project.podName === "Avengers Pod")
  },
  {
    name: "Dev Squad Pod",
    description: "Frontend and backend development team",
    active: 7,
    notactive: 3,
    members: sortTeamMembers(teamMembers.filter(member => member.pods.includes("Dev Squad Pod"))),
    projects: projects.filter(project => project.podName === "Dev Squad Pod")
  },
  {
    name: "Business Development Pod",
    description: "Sales and business strategy team",
    active: 5,
    notactive: 4,
    members: sortTeamMembers(teamMembers.filter(member => member.pods.includes("Business Development Pod"))),
    projects: projects.filter(project => project.podName === "Business Development Pod")
  },
  {
    name: "Algo Pod",
    description: "Algorithm and data structure specialists",
    active: 6,
    notactive: 2,
    members: sortTeamMembers(teamMembers.filter(member => member.pods.includes("Algo Pod"))),
    projects: projects.filter(project => project.podName === "Algo Pod")
  }
]

const PodInfo = () => {
  const [selectedPod, setSelectedPod] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePodClick = (pod) => {
    console.log('Pod clicked:', pod);
    setSelectedPod(pod)
    setIsModalOpen(true)
    console.log('isModalOpen set to:', true);
  }
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredPods = pods.filter(pod =>
    pod.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  return (
    <div className="teamPage">
      <div className="container1">
        <h1 className="title">
          Team Pods Overview
        </h1>
        <p className="subtitle">
          Cross-functional teams working together to achieve our goals
        </p>
        <div className="searchContainer1">
        <div className="searchWrapper1">
          <FaSearch className="searchIcon1" />
          <input
            type="text"
            placeholder="Search pods..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="searchInput1"
          />
        </div>
      </div>
        <div className="podGrid">
        {filteredPods.map((pods, index) => (
          <PodCard key={index} pod={pods} onClick={() => handlePodClick(pods)} />
        ))}
        </div>
      </div>

      {isModalOpen && selectedPod && (
        console.log('Rendering TeamModal'),
        <TeamModal
          pod={selectedPod}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

export default PodInfo

