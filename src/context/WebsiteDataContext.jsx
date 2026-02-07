import React, { createContext, useContext, useState } from 'react';

const WebsiteDataContext = createContext();

export const useWebsiteData = () => {
  const context = useContext(WebsiteDataContext);
  if (!context) {
    throw new Error('useWebsiteData must be used within a WebsiteDataProvider');
  }
  return context;
};

export const WebsiteDataProvider = ({ children }) => {
  const [websiteCourses, setWebsiteCourses] = useState([
    {
      id: '1',
      image: 'https://via.placeholder.com/300x200',
      courseType: 'Beginner',
      title: 'React.js Complete Course',
      technology: 'React, JavaScript',
      progress: 85,
      instructor: 'Abhay Vishwakarma',
      instructorImage: 'https://via.placeholder.com/40x40',
      status: 'Active',
      badge: 'popular'
    },
    {
      id: '2',
      image: 'https://via.placeholder.com/300x200',
      courseType: 'Intermediate',
      title: 'Flutter Mobile Development',
      technology: 'Flutter, Dart',
      progress: 60,
      instructor: 'Priya Sharma',
      instructorImage: 'https://via.placeholder.com/40x40',
      status: 'Active',
      badge: 'trending'
    },
    {
      id: '3',
      image: 'https://via.placeholder.com/300x200',
      courseType: 'Advance',
      title: 'Node.js Backend Development',
      technology: 'Node.js, Express',
      progress: 40,
      instructor: 'Rohit Kumar',
      instructorImage: 'https://via.placeholder.com/40x40',
      status: 'Disabled',
      badge: 'top'
    }
  ]);

  const [websiteCategories, setWebsiteCategories] = useState([
    {
      id: '1',
      image: 'https://via.placeholder.com/300x200',
      technology: 'React, JavaScript, Node.js',
      description: 'Complete web development stack with modern technologies',
      status: 'Active'
    },
    {
      id: '2',
      image: 'https://via.placeholder.com/300x200',
      technology: 'Flutter, Dart, Firebase',
      description: 'Cross-platform mobile app development framework',
      status: 'Active'
    },
    {
      id: '3',
      image: 'https://via.placeholder.com/300x200',
      technology: 'Python, Django, PostgreSQL',
      description: 'Backend development with Python and modern frameworks',
      status: 'Disabled'
    }
  ]);

  const [websiteReviews, setWebsiteReviews] = useState([
    {
      id: '1',
      image: 'https://via.placeholder.com/60x60',
      name: 'Rahul Sharma',
      role: 'Full Stack Developer',
      rating: 5,
      description: 'Excellent course content and great instructor. Learned a lot about React and Node.js development.',
      status: 'Active'
    },
    {
      id: '2',
      image: 'https://via.placeholder.com/60x60',
      name: 'Priya Singh',
      role: 'Frontend Developer',
      rating: 4,
      description: 'Very helpful course for beginners. The explanations are clear and easy to understand.',
      status: 'Active'
    },
    {
      id: '3',
      image: 'https://via.placeholder.com/60x60',
      name: 'Amit Kumar',
      role: 'Software Engineer',
      rating: 5,
      description: 'Outstanding quality of content. Highly recommend this course to anyone looking to learn web development.',
      status: 'Disabled'
    }
  ]);

  const addWebsiteCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: Date.now().toString(),
      badge: courseData.badge || 'normal'
    };
    setWebsiteCourses(prev => [...prev, newCourse]);
  };

  const updateWebsiteCourse = (id, courseData) => {
    setWebsiteCourses(prev => 
      prev.map(course => course.id === id ? { ...course, ...courseData } : course)
    );
  };

  const deleteWebsiteCourse = (id) => {
    setWebsiteCourses(prev => prev.filter(course => course.id !== id));
  };

  const addWebsiteCategory = (categoryData) => {
    const newCategory = {
      ...categoryData,
      id: Date.now().toString(),
    };
    setWebsiteCategories(prev => [...prev, newCategory]);
  };

  const updateWebsiteCategory = (id, categoryData) => {
    setWebsiteCategories(prev => 
      prev.map(category => category.id === id ? { ...category, ...categoryData } : category)
    );
  };

  const deleteWebsiteCategory = (id) => {
    setWebsiteCategories(prev => prev.filter(category => category.id !== id));
  };

  const addWebsiteReview = (reviewData) => {
    const newReview = {
      ...reviewData,
      id: Date.now().toString(),
    };
    setWebsiteReviews(prev => [...prev, newReview]);
  };

  const updateWebsiteReview = (id, reviewData) => {
    setWebsiteReviews(prev => 
      prev.map(review => review.id === id ? { ...review, ...reviewData } : review)
    );
  };

  const deleteWebsiteReview = (id) => {
    setWebsiteReviews(prev => prev.filter(review => review.id !== id));
  };

  const [websiteBlogs, setWebsiteBlogs] = useState([
    {
      id: '1',
      image: 'https://via.placeholder.com/400x250',
      createdAt: '2024-01-15',
      title: 'Getting Started with React Development',
      description: 'Learn the fundamentals of React development and build your first application with modern JavaScript frameworks.',
      status: 'Active'
    },
    {
      id: '2',
      image: 'https://via.placeholder.com/400x250',
      createdAt: '2024-01-10',
      title: 'Advanced Node.js Backend Techniques',
      description: 'Explore advanced backend development techniques using Node.js, Express, and modern database solutions.',
      status: 'Active'
    },
    {
      id: '3',
      image: 'https://via.placeholder.com/400x250',
      createdAt: '2024-01-05',
      title: 'Mobile App Development with Flutter',
      description: 'Complete guide to building cross-platform mobile applications using Flutter and Dart programming language.',
      status: 'Disabled'
    }
  ]);

  const addWebsiteBlog = (blogData) => {
    const newBlog = {
      ...blogData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setWebsiteBlogs(prev => [...prev, newBlog]);
  };

  const updateWebsiteBlog = (id, blogData) => {
    setWebsiteBlogs(prev => 
      prev.map(blog => blog.id === id ? { ...blog, ...blogData } : blog)
    );
  };

  const deleteWebsiteBlog = (id) => {
    setWebsiteBlogs(prev => prev.filter(blog => blog.id !== id));
  };

  const [websiteSubscriptions, setWebsiteSubscriptions] = useState([
    {
      id: '1',
      planType: 'monthly',
      duration: '1 Month',
      price: 999,
      benefits: 'Access to all courses, Download materials, Certificate of completion, Email support',
      badge: 'popular',
      status: 'Active'
    },
    {
      id: '2',
      planType: 'yearly',
      duration: '12 Months',
      price: 9999,
      benefits: 'Access to all courses, Download materials, Certificate of completion, Priority support, Live sessions',
      badge: 'best-value',
      status: 'Active'
    },
    {
      id: '3',
      planType: 'monthly',
      duration: '3 Months',
      price: 2499,
      benefits: 'Access to selected courses, Download materials, Certificate of completion',
      badge: 'normal',
      status: 'Disabled'
    }
  ]);
  const addWebsiteSubscription = (subscriptionData) => {
    const newSubscription = {
      ...subscriptionData,
      id: Date.now().toString()
    };
    setWebsiteSubscriptions(prev => [...prev, newSubscription]);
  };

  const updateWebsiteSubscription = (id, subscriptionData) => {
    setWebsiteSubscriptions(prev => 
      prev.map(subscription => subscription.id === id ? { ...subscription, ...subscriptionData } : subscription)
    );
  };

  const deleteWebsiteSubscription = (id) => {
    setWebsiteSubscriptions(prev => prev.filter(subscription => subscription.id !== id));
  };
  const value = {
    websiteCourses,
    addWebsiteCourse,
    updateWebsiteCourse,
    deleteWebsiteCourse,
    websiteCategories,
    addWebsiteCategory,
    updateWebsiteCategory,
    deleteWebsiteCategory,
    websiteReviews,
    addWebsiteReview,
    updateWebsiteReview,
    deleteWebsiteReview,
    websiteBlogs,
    addWebsiteBlog,
    updateWebsiteBlog,
    deleteWebsiteBlog,
    websiteSubscriptions,
    addWebsiteSubscription,
    updateWebsiteSubscription,
    deleteWebsiteSubscription
  };

  return (
    <WebsiteDataContext.Provider value={value}>
      {children}
    </WebsiteDataContext.Provider>
  );
};