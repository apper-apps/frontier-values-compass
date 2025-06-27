import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const StepIndicator = ({ currentStep, totalSteps = 6, className = '' }) => {
  const steps = [
    { number: 1, title: 'Standard Elicitation', icon: 'MessageSquare' },
    { number: 2, title: 'Motivation Strategy', icon: 'Zap' },
    { number: 3, title: 'Threshold Values', icon: 'Target' },
    { number: 4, title: 'Ranking', icon: 'ArrowUpDown' },
    { number: 5, title: 'Validation', icon: 'CheckCircle' },
    { number: 6, title: 'Complex Equivalents', icon: 'Layers' }
  ]

  return (
    <div className={`${className}`}>
      {/* Mobile - Compact view */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-surface-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">
              {currentStep}
            </div>
            <div>
              <p className="font-medium text-primary text-sm">
                Step {currentStep} of {totalSteps}
              </p>
              <p className="text-xs text-secondary">
                {steps[currentStep - 1]?.title}
              </p>
            </div>
          </div>
          <div className="w-20 bg-surface-200 rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Desktop - Full view */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-surface-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-primary">Progress</h3>
            <span className="text-sm text-secondary">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = step.number < currentStep
              const isCurrent = step.number === currentStep
              const isUpcoming = step.number > currentStep
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    transition-all duration-300
                    ${isCompleted ? 'bg-success text-white' : 
                      isCurrent ? 'bg-primary text-white' : 
                      'bg-surface-200 text-secondary'}
                  `}>
                    {isCompleted ? (
                      <ApperIcon name="Check" size={16} />
                    ) : (
                      <ApperIcon name={step.icon} size={16} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`
                      font-medium transition-colors duration-300
                      ${isCurrent ? 'text-primary' : 
                        isCompleted ? 'text-success' : 
                        'text-secondary'}
                    `}>
                      {step.title}
                    </p>
                    {isCurrent && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-1 bg-primary rounded-full mt-1"
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepIndicator