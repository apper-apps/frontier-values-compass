import mockSessions from '@/services/mockData/sessions.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class SessionService {
  constructor() {
    this.sessions = [...mockSessions]
    this.nextId = Math.max(...this.sessions.map(s => s.Id)) + 1
  }

  async getAll() {
    await delay(300)
    return [...this.sessions]
  }

  async getById(id) {
    await delay(200)
    const session = this.sessions.find(s => s.Id === parseInt(id, 10))
    if (!session) {
      throw new Error('Session not found')
    }
    return { ...session }
  }

  async create(sessionData) {
    await delay(300)
    const newSession = {
      Id: this.nextId++,
      ...sessionData,
      timestamp: new Date().toISOString()
    }
    this.sessions.push(newSession)
    return { ...newSession }
  }

  async update(id, sessionData) {
    await delay(300)
    const index = this.sessions.findIndex(s => s.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Session not found')
    }
    
    const updatedSession = {
      ...this.sessions[index],
      ...sessionData,
      Id: this.sessions[index].Id // Preserve ID
    }
    
    this.sessions[index] = updatedSession
    return { ...updatedSession }
  }

  async delete(id) {
    await delay(200)
    const index = this.sessions.findIndex(s => s.Id === parseInt(id, 10))
    if (index === -1) {
      throw new Error('Session not found')
    }
    this.sessions.splice(index, 1)
    return true
  }

  async getCurrentSession() {
    await delay(200)
    // Return the most recent session or create a new one
    const currentSession = this.sessions.find(s => s.current) || this.sessions[this.sessions.length - 1]
    if (currentSession) {
      return { ...currentSession }
    }
    
    // Create new session if none exists
    return this.create({
      currentStep: 1,
      responses: [],
      values: [],
      current: true
    })
  }

  async saveResponse(stepId, question, answer, followUps = []) {
    await delay(200)
    const currentSession = await this.getCurrentSession()
    
    const response = {
      stepId,
      question,
      answer,
      followUps,
      timestamp: new Date().toISOString()
    }
    
    // Update or add response
    const existingIndex = currentSession.responses.findIndex(r => r.stepId === stepId && r.question === question)
    if (existingIndex >= 0) {
      currentSession.responses[existingIndex] = response
    } else {
      currentSession.responses.push(response)
    }
    
    return this.update(currentSession.Id, currentSession)
  }

  async addValue(valueName, category = 'general') {
    await delay(200)
    const currentSession = await this.getCurrentSession()
    
    const value = {
      id: Date.now().toString(),
      name: valueName,
      importance: currentSession.values.length + 1,
      descriptions: {},
      category
    }
    
    currentSession.values.push(value)
    return this.update(currentSession.Id, currentSession)
  }

  async updateValueOrder(orderedValues) {
    await delay(200)
    const currentSession = await this.getCurrentSession()
    currentSession.values = orderedValues.map((value, index) => ({
      ...value,
      importance: index + 1
    }))
    return this.update(currentSession.Id, currentSession)
  }

  async updateValueDescriptions(valueId, descriptions) {
    await delay(200)
    const currentSession = await this.getCurrentSession()
    const valueIndex = currentSession.values.findIndex(v => v.id === valueId)
    
    if (valueIndex >= 0) {
      currentSession.values[valueIndex].descriptions = {
        ...currentSession.values[valueIndex].descriptions,
        ...descriptions
      }
    }
    
    return this.update(currentSession.Id, currentSession)
  }

  async updateStep(step) {
    await delay(200)
    const currentSession = await this.getCurrentSession()
    currentSession.currentStep = step
    return this.update(currentSession.Id, currentSession)
  }
}

export default new SessionService()