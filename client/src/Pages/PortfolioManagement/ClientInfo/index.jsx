
import React, { useState, useEffect, useCallback } from "react";
import { FaCode, FaDollarSign, FaFileAlt, FaBullseye } from "react-icons/fa";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Badge from '../../../component/ClientInfo/Badge';
import { CardContent } from '../../../component/ClientInfo/Cards';
import { Avatar } from '../../../component/ClientInfo/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../component/ClientInfo/Tabs';
import ReviewCard from '../../../component/ClientInfo/ReviewCard';
import SearchBar from '../../../component/ClientInfo/SearchBar';
import MilestoneCard from '../../../component/ClientInfo/MilestoneCard';
import ProjectCard from '../../../component/ProjectCard'
import { getClientInfo,getAllRevenueData,getTechStackById  } from '../../../api/projectApi';
import { getAllProjects } from "../../../api/projectApi";
import "./ClientInfo.scss";
import { useParams } from 'react-router-dom';
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
   const { id } = useParams();
  const [activeTab, setActiveTab] = useState("work");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientInfo, setClientInfo] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [revenue, setRevenue] = useState({ total: 0, invoicesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [, setSearchHistory] = useState([]);
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [currentMilestonePage, setCurrentMilestonePage] = useState(1);
  const [, setClientId] = useState(null);


  
  // Fetch client data
  const fetchClientData = async () => {
    try {
      const clientData = await getClientInfo(id);
      setClientId(clientData._id); // Assuming the API returns a `_id`
      setClientInfo(clientData);
      return clientData._id;
    } catch (error) {
      console.error("Error fetching client info:", error);
      throw error;
    }
  };

  // Fetch projects for the client
  const fetchProjects = async (id) => {
    try {
      const allProjects = await getAllProjects();
      const filtered = allProjects.filter(
        (project) => project.client_id === id
      );
      setProjects(filtered);
      setFilteredProjects(filtered);
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  };


  const fetchRevenueAndBenefits = async (clientID) => {
    try {
      const allRevenue = await getAllRevenueData();
  
      // Collect project IDs for the client
      const projectIds = new Set(filteredProjects.map((project) => project._id));
  
      // Calculate total revenue and benefits
      const { totalRevenue, totalBenefits } = allRevenue.reduce(
        (acc, revenueItem) => {
          if (projectIds.has(revenueItem.project_id)) {
            acc.totalRevenue += revenueItem.revenue || 0;
            acc.totalBenefits += revenueItem.benefits?.reduce((a, b) => a + b, 0) || 0;
          }
          return acc;
        },
        { totalRevenue: 0, totalBenefits: 0 }
      );
  
      setRevenue({
        total: totalRevenue,
        invoicesCount: totalBenefits ,
      });
    } catch (error) {
      console.error("Error fetching revenue and benefits:", error);
    }
  };
  
  const fetchTechStackDetails = async (techStackIds) => {
    try {
      const uniqueIds = Array.from(new Set(techStackIds)); // Deduplicate IDs
      const techStackPromises = uniqueIds.map((id) => getTechStackById(id));
      const techStackDetails = await Promise.all(techStackPromises);
  
      // Deduplicate fetched details by a unique property (e.g., `id`)
      const uniqueTechStack = Array.from(
        new Map(techStackDetails.map((tech) => [tech.id, tech])).values()
      );
  
      setTechStack(uniqueTechStack); // Save deduplicated details in state
    } catch (error) {
      console.error("Error fetching tech stack details:", error);
    }
  };
  

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientData, allProjects, allRevenue] = await Promise.all([
          getClientInfo(id),
          getAllProjects(),
          getAllRevenueData(),
        ]);
  
        setClientInfo(clientData);
        const clientProjects = allProjects.filter(project => project.client_id._id === clientData._id);
  
        setProjects(clientProjects);
        setFilteredProjects(clientProjects);
  
        const projectIds = new Set(clientProjects.map(project => project._id));
        const { totalRevenue, totalBenefits } = allRevenue.reduce(
          (acc, revenueItem) => {
            if (projectIds.has(revenueItem.project_id)) {
              acc.totalRevenue += revenueItem.revenue || 0;
              acc.totalBenefits += revenueItem.benefits?.reduce((a, b) => a + b, 0) || 0;
            }
            return acc;
          },
          { totalRevenue: 0, totalBenefits: 0 }
        );
  
        setRevenue({ total: totalRevenue, invoicesCount: totalBenefits });
  
        const allTechStackIds = clientProjects.flatMap(project => project.techStack);
        const uniqueTechStackIds = Array.from(new Set(allTechStackIds));
        const techStackDetails = await Promise.all(
          uniqueTechStackIds.map(techId => getTechStackById(techId))
        );
  
        // Deduplicate tech stack details by a unique property (e.g., `id`)
        const uniqueTechStackDetails = Array.from(
          new Map(techStackDetails.map(tech => [tech._id, tech])).values()
        );
  
        setTechStack(uniqueTechStackDetails);
      } catch (error) {
        console.error("Error during data fetch:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  

  const [projectsEmblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [reviewsEmblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [milestonesEmblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!clientInfo) {
    return <div>No client information found.</div>;
  }
  const getInitials = (name) => {
    const words = name.split(' ');
    return words.length === 1
      ? words[0][0].toUpperCase()
      : `${words[0][0]}${words[1][0]}`.toUpperCase();
  };
  
  const stats = [
    { title: "Projects", value: projects.length, icon: FaCode },
    { title: "Total Revenue", value: revenue.total, prefix: "$", icon: FaDollarSign },
    { title: "Total Benefits", value: revenue.invoicesCount, icon: FaFileAlt },
    { title: "Milestones", value: milestones.length, icon: FaBullseye },
  ];

  const itemsPerPage = 3;
  const projectPageCount = Math.ceil(filteredProjects.length / itemsPerPage);
  const reviewPageCount = Math.ceil(reviews.length / itemsPerPage);
  const milestonePageCount = Math.ceil(milestones.length / itemsPerPage);

  const currentProjects = filteredProjects.slice(
    (currentProjectPage - 1) * itemsPerPage,
    currentProjectPage * itemsPerPage
  );

  const currentReviews = reviews.slice(
    (currentReviewPage - 1) * itemsPerPage,
    currentReviewPage * itemsPerPage
  );

  const currentMilestones = milestones.slice(
    (currentMilestonePage - 1) * itemsPerPage,
    currentMilestonePage * itemsPerPage
  );
  

  return (
    <div className="portfolio-page">
      <div className="profile-section">
         {clientInfo.image ? (
            <Avatar
              src={clientInfo.image}
              alt={clientInfo.name}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar" style={{color:'white'}}>
            {getInitials(clientInfo.name)}
          </div>
          )}
        

        <div className="profile-info">
          <div className="profile-header">
            <h1 className="profile-name">{clientInfo.name}</h1>
            <Badge className="profile-badge">Client</Badge>
          </div>
          <p className="profile-title">Point of Contact : {clientInfo.point_of_contact}</p>
          <p className="profile-title">{clientInfo.description}</p>
          <p className="profile-location">{clientInfo.contact_info}</p>
        </div>

        <div className="content-container">
          <div className="stats-grid">
            {stats.map(({ title, value, prefix, icon: Icon }) => (
              <div key={title} className="info-boxs">
                <CardContent>
                  <div className="stat-header">
                    <Icon className="stat-icon" />
                    <p className="stat-title">{title}</p>
                  </div>
                  <p className="stat-value">
                    {prefix}{value.toLocaleString()}
                  </p>
                </CardContent>
              </div>
            ))}
          </div>
          <div className="tech-stack">
  <p className="tech-stack-title">Tech Stack:</p>
  <div className="tech-stack-icons">
    {techStack.map((tech, index) => (
      <span key={index} className="tech-item">
        {tech.name} {/* Assuming `name` is the property you want to display */}
      </span>
    ))}
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
            Projects
          </TabsTrigger>
       {/* 
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
*/}

        </TabsList>

        <TabsContent isActive={activeTab === "work"}>
        <SearchBar
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    projects={projects}
    setFilteredProjects={setFilteredProjects}
  />
          <div className="projects-carousel" ref={projectsEmblaRef}>
            <div className="projects-container1">
              {currentProjects.map((project) => (
                <div key={project._id} className="project-slide">
                  <ProjectCard project={project} techStack={techStack} />
                </div>
                
              ))}
            </div>
            <div className="pagination1">
              <button-container onClick={() => setCurrentProjectPage(prev => Math.max(prev - 1, 1))}
                disabled={currentProjectPage === 1}
              >
                Previous
              </button-container>
              <span>{currentProjectPage} of {projectPageCount}</span>
              <button-container onClick={() => setCurrentProjectPage(prev => Math.min(prev + 1, projectPageCount))}
                disabled={currentProjectPage === projectPageCount}
              >
                Next
              </button-container>
            </div>
          </div>
        </TabsContent>

        <TabsContent isActive={activeTab === "reviews"}>
          <div className="reviews-carousel" ref={reviewsEmblaRef}>
            <div className="reviews-container">
              {currentReviews.map((review) => (
                <div key={review.id} className="review-slide">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
            <div className="pagination1">
              <button-container onClick={() => setCurrentReviewPage(prev => Math.max(prev - 1, 1))}
                disabled={currentReviewPage === 1}
              >
                Previous
              </button-container>
              <span>{currentReviewPage} of {reviewPageCount}</span>
              <button-container onClick={() => setCurrentReviewPage(prev => Math.min(prev + 1, reviewPageCount))}
                disabled={currentReviewPage === reviewPageCount}
              >
                Next
              </button-container>
            </div>
          </div>
        </TabsContent>

        <TabsContent isActive={activeTab === "milestones"}>
          <div className="milestones-carousel" ref={milestonesEmblaRef}>
            <div className="milestones-container">
              {currentMilestones.map((milestone) => (
                <div key={milestone.id} className="milestone-slide">
                  <MilestoneCard milestone={milestone} />
                </div>
              ))}
            </div>
            <div className="pagination1">
              <button-container onClick={() => setCurrentMilestonePage(prev => Math.max(prev - 1, 1))}
                disabled={currentMilestonePage === 1}
              >
                Previous
              </button-container>
              <span>{currentMilestonePage} of {milestonePageCount}</span>
              <button-container onClick={() => setCurrentMilestonePage(prev => Math.min(prev + 1, milestonePageCount))}
                disabled={currentMilestonePage === milestonePageCount}
              >
                Next
              </button-container>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ClientInfo;

