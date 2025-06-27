import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const QuestionCard = ({ 
  question, 
  subtitle, 
  icon, 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-white rounded-xl p-6 md:p-8 shadow-sm border border-surface-200 ${className}`}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mb-6">
          <ApperIcon name={icon} size={24} className="text-primary" />
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="font-display text-xl md:text-2xl text-primary mb-2 leading-tight">
          {question}
        </h2>
        {subtitle && (
          <p className="text-secondary text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      
      {children}
    </motion.div>
  )
}

export default QuestionCard