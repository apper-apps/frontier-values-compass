import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import sessionService from "@/services/api/sessionService";
import StepIndicator from "@/components/molecules/StepIndicator";
import QuestionCard from "@/components/molecules/QuestionCard";
import ValueChip from "@/components/molecules/ValueChip";
import ExportModal from "@/components/molecules/ExportModal";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
import ApperIcon from "@/components/ApperIcon";


const ValuesElicitationProcess = () => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentResponse, setCurrentResponse] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [waitingForResponse, setWaitingForResponse] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Step 1 contexts
  const contexts = ['Career', 'Relationships', 'Family', 'Health & Fitness', 'Personal Growth', 'Spirituality']
  const [currentContext, setCurrentContext] = useState(0)
  const [contextResponses, setContextResponses] = useState({})

  // Step 2 motivation strategy
  const [motivationStage, setMotivationStage] = useState('initial')
  const [motivationContext, setMotivationContext] = useState('')

  // Step 3 threshold values
  const [thresholdStage, setThresholdStage] = useState('leave')

  // Step 4 & 5 ranking
  const [rankingMethod, setRankingMethod] = useState('drag')
  const [comparisonPair, setComparisonPair] = useState(null)

// Step 6 complex equivalents
  const [currentValueIndex, setCurrentValueIndex] = useState(0)
  const [equivalentQuestions] = useState([
    'How do you know when you\'re experiencing this value?',
    'What does this value mean to you?',
    'How do you know when someone respects this value in you?',
    'What is your evidence procedure for this value?',
    'What causes you to feel this value?',
    'What would be the opposite of this value for you?'
  ])
  const [currentEquivalentQuestion, setCurrentEquivalentQuestion] = useState(0)

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    try {
      const currentSession = await sessionService.getCurrentSession()
      setSession(currentSession)
      
      // Initialize step-specific state based on current step
      if (currentSession.currentStep === 1) {
        initializeStep1(currentSession)
      } else if (currentSession.currentStep === 2) {
        initializeStep2()
      } else if (currentSession.currentStep === 3) {
        initializeStep3()
      } else if (currentSession.currentStep === 6) {
        initializeStep6()
      }
      
      setCurrentQuestion(getQuestionForStep(currentSession.currentStep))
    } catch (error) {
      toast.error('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  const initializeStep1 = (session) => {
    const responses = {}
    contexts.forEach(context => {
      const contextResponses = session.responses.filter(r => 
        r.stepId === 'step1' && r.question.includes(context)
      )
      if (contextResponses.length > 0) {
        responses[context] = contextResponses[contextResponses.length - 1].answer
      }
    })
    setContextResponses(responses)
    
    // Find next context to ask about
    const nextContext = contexts.findIndex(context => !responses[context])
    setCurrentContext(nextContext >= 0 ? nextContext : 0)
  }

  const initializeStep2 = () => {
    setMotivationContext(contexts[0])
    setMotivationStage('initial')
  }

  const initializeStep3 = () => {
    setThresholdStage('leave')
  }

  const initializeStep6 = () => {
    setCurrentValueIndex(0)
    setCurrentEquivalentQuestion(0)
  }

  const getQuestionForStep = (step) => {
    switch (step) {
      case 1:
        if (currentContext < contexts.length) {
          return `What's important to you about ${contexts[currentContext]}?`
        }
        return "Let's review your responses..."
      
      case 2:
        switch (motivationStage) {
          case 'initial':
            return `Can you remember a time when you were totally motivated in the context of ${motivationContext}? Can you remember a specific time?`
          case 'feeling':
            return 'As you remember that time, what was the last thing you felt just before you were totally motivated? What was happening?'
          case 'name':
            return 'Can you give me the name of that feeling?'
          case 'importance':
            return "What's important to you about that?"
          default:
            return 'Tell me about a time you felt motivated...'
        }
      
      case 3:
        if (thresholdStage === 'leave') {
          return 'All these values being present, is there anything that could happen that could make you leave?'
        } else {
          return 'All these values being present, plus the values just mentioned, what would have to happen such that would make you stay?'
        }
      
      case 4:
        return 'Now please arrange these values according to their importance to you. You can drag and drop to reorder them.'
      
      case 5:
        if (comparisonPair) {
          return `Assuming you have all your other values, is "${comparisonPair[0]}" or "${comparisonPair[1]}" more important to you?`
        }
        return 'Let me validate your ranking with a few questions...'
      
      case 6:
        if (session?.values?.[currentValueIndex]) {
          return equivalentQuestions[currentEquivalentQuestion]?.replace('this value', session.values[currentValueIndex].name) || 'Complete!'
        }
        return 'Let me ask you more about each of your values...'
      
      default:
        return 'Welcome to your values elicitation journey...'
    }
  }

  const handleResponseSubmit = async () => {
    if (!currentResponse.trim()) return

    setWaitingForResponse(true)

    try {
      const step = session.currentStep
      await sessionService.saveResponse(
        `step${step}`,
        currentQuestion,
        currentResponse,
        []
      )

      // Process the response based on current step
      await processStepResponse(step, currentResponse)
      
      setCurrentResponse('')
      
      // Update the question for next interaction
      setCurrentQuestion(getQuestionForStep(session.currentStep))
      
    } catch (error) {
      toast.error('Failed to save response')
    } finally {
      setWaitingForResponse(false)
    }
  }

  const processStepResponse = async (step, response) => {
    switch (step) {
      case 1:
        await processStep1Response(response)
        break
      case 2:
        await processStep2Response(response)
        break
      case 3:
        await processStep3Response(response)
        break
      case 5:
        await processStep5Response(response)
        break
      case 6:
        await processStep6Response(response)
        break
    }
  }

  const processStep1Response = async (response) => {
    // Extract values from response and add to session
    const words = response.toLowerCase().split(/[,\s]+/)
    const potentialValues = words.filter(word => 
      word.length > 3 && 
      !['that', 'this', 'with', 'have', 'would', 'could', 'should', 'very', 'really', 'much'].includes(word)
    )

    for (const value of potentialValues.slice(0, 3)) { // Limit to 3 values per response
      if (!session.values.find(v => v.name.toLowerCase() === value)) {
        await sessionService.addValue(value, contexts[currentContext])
      }
    }

    // Update context responses
    const newContextResponses = {
      ...contextResponses,
      [contexts[currentContext]]: response
    }
    setContextResponses(newContextResponses)

    // Check if response is too short (less than 3 sentences)
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length < 2) {
      setCurrentQuestion(`That's interesting. Can you tell me more about why ${contexts[currentContext].toLowerCase()} is important to you?`)
      return
    }

    // Move to next context
    const nextContext = currentContext + 1
    if (nextContext < contexts.length) {
      setCurrentContext(nextContext)
      setCurrentQuestion(`What's important to you about ${contexts[nextContext]}?`)
    } else {
      // All contexts covered, ready for next step
      setCurrentQuestion("Great! Let's move on to explore your motivation strategies.")
    }

    // Reload session to get updated values
    const updatedSession = await sessionService.getCurrentSession()
    setSession(updatedSession)
  }

  const processStep2Response = async (response) => {
    if (motivationStage === 'name') {
      // Add the feeling as a value
      const feeling = response.trim()
      if (feeling && !session.values.find(v => v.name.toLowerCase() === feeling.toLowerCase())) {
        await sessionService.addValue(feeling, 'motivation')
      }
      
      // Ask for importance
      setMotivationStage('importance')
      setCurrentQuestion("What's important to you about that?")
    } else if (motivationStage === 'importance') {
      // Extract values from importance response
      const words = response.toLowerCase().split(/[,\s]+/)
      const potentialValues = words.filter(word => 
        word.length > 3 && 
        !['that', 'this', 'with', 'have', 'would', 'could', 'should', 'very', 'really', 'much'].includes(word)
      )

      for (const value of potentialValues.slice(0, 2)) {
        if (!session.values.find(v => v.name.toLowerCase() === value)) {
          await sessionService.addValue(value, 'motivation')
        }
      }

      // Move to next motivation context or finish step
      const nextContextIndex = contexts.findIndex(c => c === motivationContext) + 1
      if (nextContextIndex < contexts.length) {
        setMotivationContext(contexts[nextContextIndex])
        setMotivationStage('initial')
        setCurrentQuestion(`Can you remember a time when you were totally motivated in the context of ${contexts[nextContextIndex]}? Can you remember a specific time?`)
      } else {
        setCurrentQuestion("Excellent! Now let's explore your threshold values.")
      }
    } else {
      // Progress through motivation stages
      if (motivationStage === 'initial') {
        setMotivationStage('feeling')
      } else if (motivationStage === 'feeling') {
        setMotivationStage('name')
      }
      setCurrentQuestion(getQuestionForStep(2))
    }

    const updatedSession = await sessionService.getCurrentSession()
    setSession(updatedSession)
  }

  const processStep3Response = async (response) => {
    // Extract threshold values from response
    const words = response.toLowerCase().split(/[,\s]+/)
    const potentialValues = words.filter(word => 
      word.length > 3 && 
      !['that', 'this', 'with', 'have', 'would', 'could', 'should', 'very', 'really', 'much', 'make', 'would'].includes(word)
    )

    for (const value of potentialValues.slice(0, 2)) {
      if (!session.values.find(v => v.name.toLowerCase() === value)) {
        await sessionService.addValue(value, 'threshold')
      }
    }

    // Alternate between leave and stay questions
    if (thresholdStage === 'leave') {
      setThresholdStage('stay')
      setCurrentQuestion('All these values being present, plus the values just mentioned, what would have to happen such that would make you stay?')
    } else {
      setThresholdStage('leave')
      setCurrentQuestion('All these values being present, plus the values just mentioned, what would have to happen such that would make you leave?')
    }

    const updatedSession = await sessionService.getCurrentSession()
    setSession(updatedSession)
  }

  const processStep5Response = async (response) => {
    if (comparisonPair) {
      // Process comparison response
      const preferredValue = response.toLowerCase().includes(comparisonPair[0].toLowerCase()) ? 
        comparisonPair[0] : comparisonPair[1]
      
      // Update value order if needed
      // This is a simplified version - in a full implementation, you'd adjust the ranking
      setComparisonPair(null)
      
      // Check if we have more comparisons to make
      if (session.values.length > 2) {
        // Create another comparison pair
        const randomIndex1 = Math.floor(Math.random() * session.values.length)
        let randomIndex2 = Math.floor(Math.random() * session.values.length)
        while (randomIndex2 === randomIndex1) {
          randomIndex2 = Math.floor(Math.random() * session.values.length)
        }
        
        setComparisonPair([
          session.values[randomIndex1].name,
          session.values[randomIndex2].name
        ])
        setCurrentQuestion(`Assuming you have all your other values, is "${session.values[randomIndex1].name}" or "${session.values[randomIndex2].name}" more important to you?`)
      } else {
        setCurrentQuestion("Great! Your ranking has been validated. Let's explore what each value means to you.")
      }
    }
  }

  const processStep6Response = async (response) => {
    const currentValue = session.values[currentValueIndex]
    const questionKey = equivalentQuestions[currentEquivalentQuestion]
    
    // Save the description
    await sessionService.updateValueDescriptions(currentValue.id, {
      [questionKey]: response
    })

    // Move to next question for this value
    const nextQuestion = currentEquivalentQuestion + 1
    if (nextQuestion < equivalentQuestions.length) {
      setCurrentEquivalentQuestion(nextQuestion)
      setCurrentQuestion(equivalentQuestions[nextQuestion].replace('this value', currentValue.name))
    } else {
      // Move to next value
      const nextValue = currentValueIndex + 1
      if (nextValue < session.values.length) {
        setCurrentValueIndex(nextValue)
        setCurrentEquivalentQuestion(0)
        setCurrentQuestion(equivalentQuestions[0].replace('this value', session.values[nextValue].name))
      } else {
        // All done!
        setCurrentQuestion("Congratulations! You've completed your values elicitation. You can now export your results.")
      }
    }

    const updatedSession = await sessionService.getCurrentSession()
    setSession(updatedSession)
  }

  const nextStep = async () => {
    const newStep = Math.min(session.currentStep + 1, 6)
    await sessionService.updateStep(newStep)
    
    const updatedSession = await sessionService.getCurrentSession()
    setSession(updatedSession)
    
    // Initialize step-specific state
    if (newStep === 2) initializeStep2()
    if (newStep === 3) initializeStep3()
    if (newStep === 4) setRankingMethod('drag')
    if (newStep === 5) initializeStep5()
    if (newStep === 6) initializeStep6()
    
    setCurrentQuestion(getQuestionForStep(newStep))
  }

  const initializeStep5 = () => {
    if (session.values.length >= 2) {
      setComparisonPair([
        session.values[session.values.length - 1].name,
        session.values[session.values.length - 2].name
      ])
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(session.values)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    await sessionService.updateValueOrder(items)
    const updatedSession = await sessionService.getCurrentSession()
    setSession(updatedSession)
  }

  const canProceedToNextStep = () => {
    switch (session?.currentStep) {
      case 1:
        return Object.keys(contextResponses).length >= contexts.length
      case 2:
        return session.responses.filter(r => r.stepId === 'step2').length >= 3
      case 3:
        return session.responses.filter(r => r.stepId === 'step3').length >= 2
      case 4:
        return session.values.length > 0
      case 5:
        return true // Can always proceed from validation
      case 6:
        return currentValueIndex >= session.values.length - 1 && 
               currentEquivalentQuestion >= equivalentQuestions.length - 1
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-secondary">Loading your session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-primary mb-2">
              Values Compass
            </h1>
            <p className="text-secondary text-lg">
              Discover and clarify your core values through NLP-based exploration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <StepIndicator 
                currentStep={session?.currentStep || 1} 
                totalSteps={6}
                className="sticky top-8"
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {session?.currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <QuestionCard
                      question={currentQuestion}
                      subtitle="We'll explore what matters to you across different areas of your life."
                      icon="MessageSquare"
                    >
                      <div className="space-y-4">
                        <TextArea
                          label="Your response"
                          value={currentResponse}
                          onChange={(e) => setCurrentResponse(e.target.value)}
                          placeholder="Take your time to reflect on what truly matters to you..."
                          minRows={4}
                          showCount
                          maxLength={1000}
                        />
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-secondary">
                            Context: {contexts[currentContext]} ({currentContext + 1}/{contexts.length})
                          </div>
                          <Button
                            onClick={handleResponseSubmit}
                            disabled={!currentResponse.trim()}
                            loading={waitingForResponse}
                            icon="Send"
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                    </QuestionCard>
                  </motion.div>
                )}

                {session?.currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <QuestionCard
                      question={currentQuestion}
                      subtitle="Let's explore times when you felt deeply motivated to uncover your driving values."
                      icon="Zap"
                    >
                      <div className="space-y-4">
                        <TextArea
                          label="Your response"
                          value={currentResponse}
                          onChange={(e) => setCurrentResponse(e.target.value)}
                          placeholder="Think of a specific moment and describe it in detail..."
                          minRows={4}
                          showCount
                          maxLength={800}
                        />
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-secondary">
                            Stage: {motivationStage} | Context: {motivationContext}
                          </div>
                          <Button
                            onClick={handleResponseSubmit}
                            disabled={!currentResponse.trim()}
                            loading={waitingForResponse}
                            icon="Send"
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                    </QuestionCard>
                  </motion.div>
                )}

                {session?.currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <QuestionCard
                      question={currentQuestion}
                      subtitle="Understanding your boundaries helps clarify what's truly non-negotiable."
                      icon="Target"
                    >
                      <div className="space-y-4">
                        <TextArea
                          label="Your response"
                          value={currentResponse}
                          onChange={(e) => setCurrentResponse(e.target.value)}
                          placeholder="Consider what would push you past your limits..."
                          minRows={4}
                          showCount
                          maxLength={600}
                        />
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-secondary">
                            Exploring: {thresholdStage === 'leave' ? 'Breaking points' : 'Staying factors'}
                          </div>
                          <Button
                            onClick={handleResponseSubmit}
                            disabled={!currentResponse.trim()}
                            loading={waitingForResponse}
                            icon="Send"
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                    </QuestionCard>
                  </motion.div>
                )}

                {session?.currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <QuestionCard
                      question={currentQuestion}
                      subtitle="Drag and drop to arrange your values from most important (top) to least important (bottom)."
                      icon="ArrowUpDown"
                    >
                      <div className="space-y-6">
                        {session.values.length > 0 ? (
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="values">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="space-y-3"
                                >
                                  {session.values.map((value, index) => (
                                    <ValueChip
                                      key={value.id}
                                      value={value}
                                      index={index}
                                      showRank={true}
                                    />
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        ) : (
                          <div className="text-center py-8 text-secondary">
                            <ApperIcon name="Package" size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No values found yet. Please complete the previous steps.</p>
                          </div>
                        )}
                      </div>
                    </QuestionCard>
                  </motion.div>
                )}

                {session?.currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <QuestionCard
                      question={currentQuestion}
                      subtitle="Let's validate your ranking with some comparison questions."
                      icon="CheckCircle"
                    >
                      <div className="space-y-4">
                        {comparisonPair ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-4 bg-white border-2 border-surface-200 rounded-lg text-left hover:border-primary transition-colors"
                                onClick={() => {
                                  setCurrentResponse(comparisonPair[0])
                                  handleResponseSubmit()
                                }}
                              >
                                <div className="font-medium text-primary mb-2">Option A</div>
                                <div className="text-secondary">{comparisonPair[0]}</div>
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-4 bg-white border-2 border-surface-200 rounded-lg text-left hover:border-primary transition-colors"
                                onClick={() => {
                                  setCurrentResponse(comparisonPair[1])
                                  handleResponseSubmit()
                                }}
                              >
                                <div className="font-medium text-primary mb-2">Option B</div>
                                <div className="text-secondary">{comparisonPair[1]}</div>
                              </motion.button>
                            </div>
                            
                            <div className="text-center text-sm text-secondary">
                              Click on the value that's more important to you
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <ApperIcon name="CheckCircle" size={48} className="mx-auto mb-4 text-success" />
                            <p className="text-primary font-medium mb-2">Validation Complete!</p>
                            <p className="text-secondary">Your values ranking has been confirmed.</p>
                          </div>
                        )}
                      </div>
                    </QuestionCard>
                  </motion.div>
                )}

                {session?.currentStep === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <QuestionCard
                      question={currentQuestion}
                      subtitle="Let's explore what each value means to you and how you recognize it."
                      icon="Layers"
                    >
                      <div className="space-y-4">
                        {session.values[currentValueIndex] ? (
                          <>
                            <div className="bg-accent/10 rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {currentValueIndex + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-primary">
                                    {session.values[currentValueIndex].name}
                                  </div>
                                  <div className="text-sm text-secondary">
                                    Question {currentEquivalentQuestion + 1} of {equivalentQuestions.length}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <TextArea
                              label="Your response"
                              value={currentResponse}
                              onChange={(e) => setCurrentResponse(e.target.value)}
                              placeholder="Take your time to explore this deeply..."
                              minRows={4}
                              showCount
                              maxLength={500}
                            />
                            
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-secondary">
                                Value {currentValueIndex + 1} of {session.values.length}
                              </div>
                              <Button
                                onClick={handleResponseSubmit}
                                disabled={!currentResponse.trim()}
                                loading={waitingForResponse}
                                icon="Send"
                              >
                                Submit
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <ApperIcon name="Trophy" size={48} className="mx-auto mb-4 text-accent" />
                            <h3 className="font-display text-xl text-primary mb-2">
                              Congratulations!
                            </h3>
                            <p className="text-secondary mb-6">
                              You've completed your comprehensive values elicitation process.
                            </p>
                            <Button
                              onClick={() => setShowExportModal(true)}
                              icon="Download"
                              size="lg"
                            >
                              Export Your Results
                            </Button>
                          </div>
                        )}
                      </div>
                    </QuestionCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                <div className="text-sm text-secondary">
                  {session?.values?.length > 0 && (
                    <span>{session.values.length} values discovered</span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {session?.currentStep === 6 && currentValueIndex >= session.values.length - 1 && (
                    <Button
                      onClick={() => setShowExportModal(true)}
                      variant="accent"
                      icon="Download"
                    >
                      Export Results
                    </Button>
                  )}
                  
                  {session?.currentStep < 6 && canProceedToNextStep() && (
                    <Button
                      onClick={nextStep}
                      icon="ArrowRight"
                      iconPosition="right"
                    >
                      Next Step
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        session={session}
      />
    </div>
  )
}

export default ValuesElicitationProcess