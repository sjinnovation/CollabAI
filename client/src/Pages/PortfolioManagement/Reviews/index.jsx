import { useState, useMemo } from 'react';
import { SearchBar } from '../../../component/Reviews/SearchBar';
import { ReviewsCarousel } from '../../../component/Reviews/ReviewCarosoul';
import './ReviewsPage.scss';

const clients = [
    {
      _id: '1',
      name: 'Sandra Long',
      description: 'Regular client',
      contact_info: 'sandra@example.com',
      point_of_contact: 'Sandra',
      image: '/placeholder.svg?height=40&width=40'
    },
    {
      _id: '2',
      name: 'Jamie Atkins',
      description: 'Premium client',
      contact_info: 'jamie@example.com',
      point_of_contact: 'Jamie',
      image: '/placeholder.svg?height=40&width=40'
    }
  ]
  
   const projects = [
    {
      _id: '1',
      name: 'Website Redesign',
      description: 'Complete website overhaul',
      status: 'Completed',
      start_time: new Date('2023-01-01'),
      end_time: new Date('2023-06-30'),
      budget: 50000,
      hr_taken: 500,
      client_id: '1',
      techStack: ['React', 'Node.js', 'MongoDB'],
      links: {
        links: 'https://example.com',
        github: 'https://github.com/example'
      },
      image_link: '/placeholder.svg'
    },
    {
      _id: '2',
      name: 'Mobile App Development',
      description: 'iOS and Android app',
      status: 'In Progress',
      start_time: new Date('2023-07-01'),
      end_time: new Date('2024-01-31'),
      budget: 75000,
      hr_taken: 300,
      client_id: '2',
      techStack: ['React Native', 'Firebase'],
      links: {
        links: 'https://example.com',
        github: 'https://github.com/example'
      },
      image_link: '/placeholder.svg'
    }
  ]
  const reviews = [
    {
      _id: '1',
      project_id: '1',
      header: 'Excellent service',
      comment: 'My 1st time booking online was simple, staff was very friendly.',
      rating: 5,
      client_name: 'Sandra Long',
      client_image: '/placeholder.svg?height=40&width=40',
      project_name: projects.find(p => p._id === '1')?.name || 'Unknown Project'
    },
    {
      _id: '2',
      project_id: '1',
      header: 'Great service',
      comment: 'Great service, was running late, but the company really helped on my arrival.',
      rating: 5,
      client_name: 'Sandra Long',
      client_image: '/placeholder.svg?height=40&width=40',
      project_name: projects.find(p => p._id === '1')?.name || 'Unknown Project'
    },
    {
      _id: '3',
      project_id: '2',
      header: 'Excellent service',
      comment: 'Excellent service, easy booking and parking. Will use again..',
      rating: 5,
      client_name: 'Jamie Atkins',
      client_image: '/placeholder.svg?height=40&width=40',
      project_name: projects.find(p => p._id === '2')?.name || 'Unknown Project'
    },
    {
      _id: '4',
      project_id: '2',
      header: 'Excellent service',
      comment: 'Excellent service, easy booking and parking. Will use again..',
      rating: 5,
      client_name: 'Jamie Atkins',
      client_image: '/placeholder.svg?height=40&width=40',
      project_name: projects.find(p => p._id === '2')?.name || 'Unknown Project'
    },
    {
      _id: '5',
      project_id: '1',
      header: 'Great service',
      comment: 'Great service, was running late, but the company really helped on my arrival.',
      rating: 5,
      client_name: 'Sandra Long',
      client_image: '/placeholder.svg?height=40&width=40',
      project_name: projects.find(p => p._id === '1')?.name || 'Unknown Project'
    }
  ]

  export default function ReviewsPage() {
    const [searchTerm, setSearchTerm] = useState('');
  
    const filteredReviews = useMemo(() => {
      if (!searchTerm) return reviews;
  
      const lowercaseSearch = searchTerm.toLowerCase();
      return reviews.filter((review) =>
        review.client_name.toLowerCase().includes(lowercaseSearch) ||
        review.header.toLowerCase().includes(lowercaseSearch) ||
        review.comment.toLowerCase().includes(lowercaseSearch) ||
        review.project_name.toLowerCase().includes(lowercaseSearch) ||
        projects.find((p) => p._id === review.project_id)?.techStack.some((tech) =>
          tech.toLowerCase().includes(lowercaseSearch)
        )
      );
    }, [searchTerm]);
  
    const averageRating = useMemo(() => {
      const total = reviews.reduce((acc, review) => acc + review.rating, 0);
      return (total / reviews.length).toFixed(1);
    }, []);
  
    return (
      <div className="container1">
        <div className="reviewsHeader">
          <h1 className="reviewsTitle">
            Company score {averageRating} out of 5, from {reviews.length.toLocaleString()} reviews.
          </h1>
          <p className="reviewsDescription">
            You can trust us to get it where it needs to be, but don't take our word for it. Read our reviews at{' '}
            <a href="#" className="reviewsLink">
              Trustpilot.com
            </a>
          </p>
        </div>
  
        <SearchBar onSearch={setSearchTerm} />
  
        <div className="carouselWrapper">
          <ReviewsCarousel filteredReviews={filteredReviews} autoplayDelay={4000} />
        </div>
  
        <div className="carouselWrapper">
          <ReviewsCarousel filteredReviews={filteredReviews} autoplayDelay={6000} />
        </div>
      </div>
    );
  }
