'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, GraduationCap, Calendar, FileText, TrendingUp, Award, ChevronLeft, ChevronRight, Music, Trophy, Gamepad2 } from 'lucide-react';

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const heroSlides = [
    {
      title: 'Transform Your Academic Journey',
      subtitle: 'University of Excellence',
      description: 'Stay updated with the latest academic talks, workshops, and social gatherings across Sri Lankan universities. Whether you\'re here to learn, network, or relax let\'s make something for everyone!',
      image: '/56735333-removebg-preview.png'
    },
    {
      title: 'Connect & Collaborate',
      subtitle: 'Learn Together',
      description: 'Join thousands of students and educators in creating an amazing academic experience. Access courses, resources, and connect with peers.',
      image: '/56735333-removebg-preview.png'
    },
    {
      title: 'Your Success Starts Here',
      subtitle: 'Academic Excellence',
      description: 'Comprehensive platform for course management, enrollment tracking, and academic resources all in one place.',
      image: '/56735333-removebg-preview.png'
    }
  ];
  

  useEffect(() => {
    setIsMounted(true);
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  if (!isMounted) return null;

  const categories = [
    { icon: Music, label: 'Music Events', color: 'bg-purple-500' },
    { icon: Users, label: 'Conferences', color: 'bg-blue-500' },
    { icon: Trophy, label: 'Annual Celebrations', color: 'bg-pink-500' },
    { icon: Gamepad2, label: 'Games', color: 'bg-indigo-500' }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Course Management',
      description: 'Create, organize, and manage academic courses with ease. Upload syllabi, set schedules, and track progress.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Student Enrollment',
      description: 'Seamless enrollment system for students. Browse courses, enroll instantly, and access all course materials.',
      color: 'purple'
    },
    {
      icon: GraduationCap,
      title: 'Lecturer Tools',
      description: 'Comprehensive tools for educators. Manage multiple courses, track student progress, and share resources.',
      color: 'indigo'
    },
    {
      icon: Calendar,
      title: 'Schedule Tracking',
      description: 'Stay organized with integrated calendar. Never miss a class, assignment, or important deadline.',
      color: 'pink'
    },
    {
      icon: FileText,
      title: 'Resource Sharing',
      description: 'Share and access course materials effortlessly. Upload documents, presentations, and study guides.',
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track performance metrics, enrollment trends, and course statistics with detailed analytics.',
      color: 'orange'
    }
  ];

  const stats = [
    { label: 'Active Courses', value: '500+', icon: BookOpen },
    { label: 'Students Enrolled', value: '10K+', icon: Users },
    { label: 'Expert Lecturers', value: '200+', icon: GraduationCap },
    { label: 'Success Rate', value: '95%', icon: Award }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden ">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/26265399.jpg')] bg-cover bg-center opacity-0" />
        
        {/* Additional Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/85 via-purple-800/90 to-pink-600/85 opacity-0" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          {/* Carousel Container */}
          <div className="relative bg-black/20 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20">
            {/* Carousel Slides */}
            <div className="relative h-[500px] md:h-[600px]">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {/* Slide Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      filter: 'brightness(0.4)'
                    }}
                  />
                  
                  {/* Slide Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/85 via-purple-800/90 to-pink-600/85" />
                  
                  {/* Slide Content */}
                  <div className="relative h-full flex items-center">
                    <div className="max-w-7xl mx-auto px-8 md:px-12 w-full">
                      <div className="max-w-2xl">
                        <p className="text-purple-200 text-sm mb-2">{slide.subtitle}</p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                          {slide.title}
                        </h1>
                        <p className="text-lg text-purple-100 mb-6 leading-relaxed">
                          {slide.description}
                        </p>
                        <Link 
                          href="/signup"
                          className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all font-semibold"
                        >
                          About Us
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all border border-white/30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all border border-white/30"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                  <input
                    type="text"
                    placeholder="Select Event Month"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">University:</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500">
                    <option>Select University</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event:</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500">
                    <option>Find Event</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Category Icons */}
          <div className="grid grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <button
                key={index}
                className="flex flex-col items-center space-y-3 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
              >
                <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-white text-sm font-medium text-center">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular academic courses and programs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group relative"
            >
              {/* Badge - Show on first 2 items */}
              {index < 2 && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    HOT
                  </div>
                </div>
              )}

              {/* Course Image */}
              <div className="relative h-40 overflow-hidden">
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${
                    feature.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    feature.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    feature.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
                    feature.color === 'pink' ? 'from-pink-500 to-pink-600' :
                    feature.color === 'green' ? 'from-green-500 to-green-600' :
                    'from-orange-500 to-orange-600'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <feature.icon className="w-20 h-20 text-white/30" />
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6">
                {/* Date and Title */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {(index + 11).toString()}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      By {['Engineering', 'Science', 'Arts', 'Management', 'Technology', 'Business'][index]} Department
                    </p>
                  </div>
                </div>

                {/* Event Type Badge */}
                <div className="inline-block mb-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    feature.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    feature.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                    feature.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                    feature.color === 'pink' ? 'bg-pink-100 text-pink-700' :
                    feature.color === 'green' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {['Workshop', 'Seminar', 'Conference', 'Festival', 'Exhibition', 'Competition'][index]}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {feature.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    University of Moratuwa
                  </div>
                  <button className="text-gray-400 hover:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <div className="flex gap-3">
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500">
              <option>Weekdays</option>
            </select>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500">
              <option>Popular</option>
            </select>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500">
              <option>Latest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-blue-600 mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Successful Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white relative">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Past Successful Events
            </h2>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Event Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="h-48 bg-gradient-to-br from-orange-400 to-pink-500 relative overflow-hidden">
                <Image
                  src="/key-note-removebg-preview.png" 
                  alt="Conference Event"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  8 Strategies to Find Your Conference Keynote and Other Speakers
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Siekiang, kertu bisa produce hari Itak unus eventes temparus finbustibus, hanya petru mengutut lobortopa languid mutah.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>4 Dec - Post Date</span>
                </div>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                <Image 
                  src="/incrememntal-sales-removebg-preview.png" 
                  alt="Marketing Event"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  How Successfully Used Paid Marketing to Drive Incremental Ticket Sales
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Siekiang, kertu bisa produce hari Itak unus eventes temparus finbustibus, hanya petru mengutut lobortopa languid mutah.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>4 Dec - Post Date</span>
                </div>
              </div>
            </div>

            {/* Event Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 relative overflow-hidden">
                <Image 
                  src="/smarter-removebg-preview.png" 
                  alt="Workspace Event"
                  className="w-full h-full object-cover"
                  width={500}
                  height={300}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Introducing Workspaces: Work smarter, not harder with new navigation
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Siekiang, kertu bisa produce hari Itak unus eventes temparus finbustibus, hanya petru mengutut lobortopa languid mutah.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>4 Dec - Post Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews About Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white relative">
        {/* Background decorative blobs */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Reviews About Us
            </h2>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Review Card 1 */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Image 
                  src="/00-1-removebg-preview.png" 
                  alt="Taylor Swift"
                  className="w-12 h-12 rounded-full mr-3"
                  width={500}
                  height={300}
                />
                <div>
                  <h4 className="font-bold text-gray-900">— Ayesha Khan, BBA Student</h4>
                  <div className="flex text-yellow-400">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                &quot;The university’s management is well-organized and responsive. Every process—from admissions to exams—runs smoothly!&quot;
              </p>
            </div>

            {/* Review Card 2 */}
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Image 
                  src="/00-2-removebg-preview.png" 
                  alt="Taylor Swift"
                  className="w-12 h-12 rounded-full mr-3"
                  width={500}
                  height={300}
                />
                <div>
                  <h4 className="font-bold text-gray-900">— Ravi Patel, Engineering Student</h4>
                  <div className="flex text-yellow-400">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                &quot;Efficient administration and supportive staff make campus life so much easier. Truly professional management!&quot;
              </p>
            </div>

            {/* Review Card 3 */}
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Image
                  src="/00-3-removebg-preview.png"
                  alt="Taylor Swift"
                  className="w-12 h-12 rounded-full mr-3"
                  width={500}
                  height={300}
                />
                <div>
                  <h4 className="font-bold text-gray-900">— Emily Johnson, Faculty Member</h4>
                  <div className="flex text-yellow-400">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                &quot;Great leadership and transparency in operations. The management genuinely cares about students growth.&quot;   
              </p>
            </div>

            {/* Review Card 4 */}
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Image
                  src="/00-4-removebg-preview.png"
                  alt="Taylor Swift"
                  className="w-12 h-12 rounded-full mr-3"
                  width={500}
                  height={300}
                />
                <div>
                  <h4 className="font-bold text-gray-900">Mohammed Al-Rashid, MBA Student</h4>
                  <div className="flex text-yellow-400">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                &quot;I appreciate how quickly the management addresses issues and introduces new initiatives for student welfare.&quot;
              </p>
            </div>

             {/* Review Card 5 */}
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Image
                  src="/00-5-removebg-preview.png" 
                  alt="Taylor Swift"
                  className="w-12 h-12 rounded-full mr-3"
                  width={500}
                  height={300}
                />
                <div>
                  <h4 className="font-bold text-gray-900">jhone, International Student</h4>
                  <div className="flex text-yellow-400">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                &quot;Excellent coordination between departments. The management ensures academic and extracurricular balance.&quot;
              </p>
            </div>

             {/* Review Card 6 */}
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <Image
                  src="/00-6-removebg-preview.png"
                  alt="Taylor Swift"
                  className="w-12 h-12 rounded-full mr-3"
                  width={500}
                  height={300}
                />
                <div>
                  <h4 className="font-bold text-gray-900">Peter Thompson, Alumni (Class of 2022)</h4>
                  <div className="flex text-yellow-400">
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                &quot;Professional, proactive, and student-friendly management. They’ve made university life organized and efficient.&quot;
              </p>
            </div>
          </div>          
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="bg-gradient-to-br from-purple-600 via-purple-800 to-pink-600 rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators using AcademiHub to enhance their academic experience
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all font-semibold text-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}