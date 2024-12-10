import React, { useState, useEffect, useCallback } from "react";
import { FaCode, FaDollarSign, FaFileAlt, FaBullseye } from "react-icons/fa";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Badge from '../../../component/ClientInfo/Badge';
import { Cards, CardContent } from '../../../component/ClientInfo/Cards';
import { Avatar } from '../../../component/ClientInfo/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../component/ClientInfo/Tabs';
import ReviewCard from '../../../component/ClientInfo/ReviewCard';
import SearchBar from '../../../component/ClientInfo/SearchBar';
import MilestoneCard from '../../../component/ClientInfo/MilestoneCard';
import ProjectCard from '../../../component/ClientInfo/ProjectCard';
import { getAllProjects } from '../../../api/projectApi';
import "./ClientInfo.scss";



const projects = [
  {
    id: 1,
    title: "VPN Mobile App",
    Description: "Mobile UI Research",
    image: "https://picsum.photos/600/400?random=1",
    Team: "Avengers",
    techStack: ["React Native", "Node.js", "Express"],
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 2,
    title: "Property Dashboard",
    Description: "Web Interface",
    image: "https://picsum.photos/600/400?random=2",
    Team: "Avengers",
    techStack: ["React", "Redux", "Material-UI"],
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 3,
    title: "Healthcare Mobile App",
    Description: "Mobile UI Branding",
    image: "https://picsum.photos/600/400?random=3",
    Team: "Avengers",
    techStack: ["Flutter", "Firebase", "GraphQL"],
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 4,
    title: "E-commerce Platform",
    Description: "Web Development",
    image: "https://picsum.photos/600/400?random=4",
    Team: "Avengers",
    techStack: ["Next.js", "Stripe", "MongoDB"],
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 5,
    title: "Fitness Tracking App",
    Description: "Mobile Development",
    image: "https://picsum.photos/600/400?random=5",
    Team: "Avengers",
    techStack: ["React Native", "Redux", "Firebase"],
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
  {
    id: 6,
    title: "Social Media Dashboard",
    Description: "Web Analytics",
    image: "https://picsum.photos/600/400?random=6",
    Team: "Avengers",
    techStack: ["Vue.js", "D3.js", "Node.js"],
    github: "https://github.com/guptapriya24/react-weather-app",
    live: "https://weather-app-demo.netlify.app",
  },
];
const reviews = [
  { id: 1, headline: "Amazing Project!", reviewer: "John Doe", comment: "Very well executed.", rating: 5, reviewerImage: "https://picsum.photos/50" },
  { id: 2, headline: "Great Work", reviewer: "Jane Smith", comment: "Great design and functionality!", rating: 4, reviewerImage: "/placeholder.svg?height=50&width=50" },
  { id: 3, headline: "Highly Recommended", reviewer: "Michael Lee", comment: "Fantastic work!", rating: 5, reviewerImage: "/placeholder.svg?height=50&width=50" },
  { id: 4, headline: "Outstanding Design", reviewer: "Emily Chen", comment: "Exceeded my expectations!", rating: 5, reviewerImage: "/placeholder.svg?height=50&width=50" },
  { id: 5, headline: "Efficient and Reliable", reviewer: "David Wang", comment: "Great communication throughout the project.", rating: 4, reviewerImage: "/placeholder.svg?height=50&width=50" },
  { id: 6, headline: "Impressive Results", reviewer: "Sarah Johnson", comment: "Delivered on time and with high quality.", rating: 5, reviewerImage: "/placeholder.svg?height=50&width=50" },
];

const milestones = [
  { id: 1, title: "Project Kickoff", description: "Initial planning and requirements gathering", status: [{ title: "Completed", owner: "Team", completed: true }] },
  { id: 2, title: "Design Phase", description: "Creating wireframes and mockups", status: [{ title: "In Progress", owner: "Designer", completed: false }] },
  { id: 3, title: "Development Sprint 1", description: "Core functionality implementation", status: [{ title: "Pending", owner: "Developers", completed: false }] },
  { id: 4, title: "User Testing", description: "Gathering feedback from beta users", status: [{ title: "Not Started", owner: "QA Team", completed: false }] },
  { id: 5, title: "Final Delivery", description: "Project handover and documentation", status: [{ title: "Not Started", owner: "Project Manager", completed: false }] },
  { id: 6, title: "Post-Launch Support", description: "Monitoring and bug fixes", status: [{ title: "Not Started", owner: "Support Team", completed: false }] },
];

const ClientInfo = () => {
  const [activeTab, setActiveTab] = useState("work");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [searchHistory, setSearchHistory] = useState([]);

  const [projectsEmblaRef, projectsEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [reviewsEmblaRef, reviewsEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [milestonesEmblaRef, milestonesEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (trimmedQuery) {
      const filtered = projects.filter((project) =>
        project.title.toLowerCase().includes(trimmedQuery) ||
        project.Description.toLowerCase().includes(trimmedQuery) ||
        project.Team.toLowerCase().includes(trimmedQuery)
      );
      setFilteredProjects(filtered);
      setSearchHistory((prev) => [...new Set([trimmedQuery, ...prev])].slice(0, 5));
    } else {
      setFilteredProjects(projects);
    }
  };

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setFilteredProjects(projects);
    setSearchHistory([]);
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredProjects(projects);
    }
  }, [searchQuery]);

  const stats = [
    { title: "Projects", value: 5, icon: FaCode },
    { title: "Total Revenue", value: 10000, prefix: "$", icon: FaDollarSign },
    { title: "Invoices", value: 25, icon: FaFileAlt },
    { title: "Milestones", value: 7, icon: FaBullseye },
  ];

  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const itemsPerPage = 3;
  const projectPageCount = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentProjectPage - 1) * itemsPerPage,
    currentProjectPage * itemsPerPage
  );

  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const ReviewPageCount = Math.ceil(reviews.length / itemsPerPage);
  const currentreviews = reviews.slice(
    (currentReviewPage - 1) * itemsPerPage,
    currentReviewPage * itemsPerPage
  );
  
  const [currentmilestonePage, setCurrentmilestonePage] = useState(1);
  const milestonePageCount = Math.ceil(milestones.length / itemsPerPage);
  const currentmilestone = milestones.slice(
    (currentmilestonePage - 1) * itemsPerPage,
    currentmilestonePage * itemsPerPage
  );

  return (
    <div className="portfolio-page">
      <div className="profile-section">
        <Avatar
          src="https://randomuser.me/api/portraits/men/1.jpg"
          alt="Irene Brooks"
          fallback="IB"
          className="profile-avatar"
        />
        
        <div className="profile-info">
          <div className="profile-header">
            <h1 className="profile-name">Irene Brooks</h1>
            <Badge className="profile-badge">Pro</Badge>
          </div>
          
          <p className="profile-title">Interface and Brand Designer</p>
          <p className="profile-location">based in San Antonio</p>
        </div>

        <div className="content-container">
          <div className="stats-grid">
            {stats.map(({ title, value, prefix, icon: Icon }) => (
              <Cards key={title} className="stat-card">
                <CardContent>
                  <div className="stat-header">
                    <Icon className="stat-icon" />
                    <p className="stat-title">{title}</p>
                  </div>
                  <p className="stat-value">
                    {prefix}{value.toLocaleString()}
                  </p>
                </CardContent>
              </Cards>
            ))}
          </div>

          <div className="tech-stack">
            <p className="tech-stack-title">Tech Stack:</p>
            <div className="tech-stack-icons">
              <span className="tech-item">React</span>
              <span className="tech-item">Node.js</span>
              <span className="tech-item">JavaScript</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs>
        <TabsList>
          <TabsTrigger
            isActive={activeTab === "work"}
            onClick={() => setActiveTab("work")}
          >
            Work
          </TabsTrigger>
          <TabsTrigger
            isActive={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            isActive={activeTab === "milestones"}
            onClick={() => setActiveTab("milestones")}
          >
            Milestones
          </TabsTrigger>
        </TabsList>
        
        <TabsContent isActive={activeTab === "work"}>
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
          />
          <div className="projects-carousel" ref={projectsEmblaRef}>
            <div className="projects-container1">
              {currentProjects.map((project) => (
                <div key={project.id} className="project-slide">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
            <div className="pagination1">
              <button1
                onClick={() => setCurrentProjectPage(prev => Math.max(prev - 1, 1))}
                disabled={currentProjectPage === 1}
              >
                Previous
              </button1>
              <span>{currentProjectPage} of {projectPageCount}</span>
              <button1
                onClick={() => setCurrentProjectPage(prev => Math.min(prev + 1, projectPageCount))}
                disabled={currentProjectPage === projectPageCount}
              >
                Next
              </button1>
            </div>
          </div>
        </TabsContent>

        <TabsContent isActive={activeTab === "reviews"}>
          <div className="reviews-carousel" ref={reviewsEmblaRef}>
            <div className="reviews-container">
              {currentreviews.map((review) => (
                <div key={review.id} className="review-slide">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
            <div className="pagination1">
              <button1
                onClick={() => setCurrentReviewPage(prev => Math.max(prev - 1, 1))}
                disabled={currentReviewPage === 1}
              >
                Previous
              </button1>
              <span>{currentReviewPage} of {ReviewPageCount}</span>
              <button1
                onClick={() => setCurrentReviewPage(prev => Math.min(prev + 1, ReviewPageCount))}
                disabled={currentReviewPage === ReviewPageCount}
              >
                Next
              </button1>
            </div>
          </div>
        </TabsContent>

        <TabsContent isActive={activeTab === "milestones"}>
          <div className="milestones-carousel" ref={milestonesEmblaRef}>
            <div className="milestones-container">
              {currentmilestone.map((milestone) => (
                <div key={milestone.id} className="milestone-slide">
                  <MilestoneCard milestone={milestone} />
                </div>
              ))}
            </div>
            <div className="pagination1">
              <button1
                onClick={() => setCurrentmilestonePage(prev => Math.max(prev - 1, 1))}
                disabled={currentmilestonePage === 1}
              >
                Previous
              </button1>
              <span>{currentmilestonePage} of {milestonePageCount}</span>
              <button1
                onClick={() => setCurrentmilestonePage(prev => Math.min(prev + 1, milestonePageCount))}
                disabled={currentmilestonePage === milestonePageCount}
              >
                Next
              </button1>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ClientInfo;