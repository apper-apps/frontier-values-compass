import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

function Home() {
const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/questionnaire')
  }

  const benefits = [
    {
      icon: 'Compass',
      title: 'Clear Direction',
      description: 'Understand what truly matters to you and align your decisions with your core values for a more purposeful life.'
    },
    {
      icon: 'Heart',
      title: 'Authentic Living',
      description: 'Live authentically by making choices that reflect your genuine self rather than external expectations.'
    },
    {
      icon: 'Target',
      title: 'Better Decisions',
      description: 'Make confident decisions faster by having a clear framework of what you value most in any situation.'
    },
    {
      icon: 'Users',
      title: 'Stronger Relationships',
      description: 'Build deeper connections by understanding and communicating your values to others who share them.'
    },
    {
      icon: 'TrendingUp',
      title: 'Personal Growth',
      description: 'Identify areas for growth and development that align with your values for meaningful progress.'
    },
    {
      icon: 'Shield',
      title: 'Stress Reduction',
      description: 'Reduce internal conflict and stress by living in harmony with your core beliefs and principles.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-highlight/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              Discover Your
              <span className="text-primary block mt-2">Core Values</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Unlock deeper self-awareness and make decisions that align with what truly matters to you. 
              Our guided process helps you identify and prioritize your core values in just minutes.
            </p>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
<Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[#f5c826] hover:bg-[#f5c826]/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ApperIcon name="Play" size={20} className="mr-2" />
                Get Started
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Why Understanding Your Values Matters
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your values are the foundation of who you are. When you understand them clearly, 
            every aspect of your life becomes more intentional and fulfilling.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-surface-200"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 mx-auto">
                <ApperIcon name={benefit.icon} size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-4 text-center">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Simple Process, Powerful Results
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our scientifically-backed approach guides you through a series of thoughtful 
              questions to help you identify what truly drives you.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {[
              {
                step: "1",
                title: "Reflect",
                description: "Answer guided questions about different life contexts and what matters most to you.",
                icon: "MessageCircle"
              },
              {
                step: "2", 
                title: "Prioritize",
                description: "Rank and organize your values to understand their relative importance in your life.",
                icon: "ArrowUpDown"
              },
              {
                step: "3",
                title: "Apply",
                description: "Get your personalized values profile and practical insights for daily decision-making.",
                icon: "Target"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
              >
                <div className="flex items-center justify-center w-20 h-20 bg-highlight/20 rounded-full mb-6 mx-auto">
                  <span className="text-2xl font-bold text-highlight">{step.step}</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

{/* CTA Section */}
      <div className="bg-gradient-to-br from-surface-50 to-surface-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Ready to Discover Your Values?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Take the first step towards a more intentional, values-driven life. 
              The journey to self-discovery starts now.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
<Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[#f5c826] text-white hover:bg-[#f5c826]/90 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ApperIcon name="ArrowRight" size={20} className="mr-2" />
                Start Your Values Journey
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Home