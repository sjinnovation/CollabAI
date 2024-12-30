import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ReviewCard } from './ReviewCard';
import './reviewcarousel.scss';
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
export function ReviewsCarousel({ filteredReviews = reviews, autoplayDelay = 4000 }) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: autoplayDelay })]
  );

  return (
    <div className="carouselContainer" ref={emblaRef}>
      <div className="carouselTrack">
        {filteredReviews.map((review) => (
          <div key={review._id} className="carouselSlide">
            <ReviewCard
              header={review.header}
              comment={review.comment}
              rating={review.rating}
              clientName={review.client_name}
              clientImage={review.client_image}
              projectName={review.project_name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
