import { INITIAL_QUIZZES, INITIAL_SUBMISSIONS } from '../mockData'
import type {
  QuizItem,
  QuizKpiStats,
  QuizQuestion,
  QuizResultSummary,
  QuizSubmissionItem,
} from '../types'

// Module-level in-memory cache
let quizzesState: QuizItem[] = [...INITIAL_QUIZZES]
const submissionsState: Record<string, QuizSubmissionItem[]> = { ...INITIAL_SUBMISSIONS }

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export const quizService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getAll(): QuizItem[] {
    return [...quizzesState]
  },

  getById(id: string): QuizItem | undefined {
    return quizzesState.find((q) => q.id === id)
  },

  getStats(): QuizKpiStats {
    const activeCount = quizzesState.filter((q) => q.status === 'active').length
    const draftCount = quizzesState.filter((q) => q.status === 'draft').length
    const totalSubmissions = quizzesState.reduce(
      (sum, q) => sum + (q.submissionsCount || 0),
      0,
    )

    const scoredQuizzes = quizzesState.filter(
      (q) => typeof q.averageScore === 'number' && q.averageScore > 0,
    )
    const averageScore =
      scoredQuizzes.length > 0
        ? Math.round(
            scoredQuizzes.reduce((sum, q) => sum + (q.averageScore || 0), 0) /
              scoredQuizzes.length,
          )
        : 78

    return {
      activeCount,
      draftCount,
      totalSubmissions,
      averageScore,
    }
  },

  create(data: Omit<QuizItem, 'id' | 'createdAt' | 'submissionsCount' | 'averageScore'>): QuizItem {
    const newQuiz: QuizItem = {
      ...data,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      submissionsCount: 0,
      averageScore: null,
      questions: data.questions || [],
    }

    quizzesState = [newQuiz, ...quizzesState]
    notifyListeners()
    return newQuiz
  },

  update(id: string, updates: Partial<QuizItem>): QuizItem | undefined {
    let updatedQuiz: QuizItem | undefined
    quizzesState = quizzesState.map((q) => {
      if (q.id === id) {
        updatedQuiz = { ...q, ...updates }
        return updatedQuiz
      }
      return q
    })
    if (updatedQuiz) {
      notifyListeners()
    }
    return updatedQuiz
  },

  delete(id: string): boolean {
    const prevLength = quizzesState.length
    quizzesState = quizzesState.filter((q) => q.id !== id)
    if (quizzesState.length !== prevLength) {
      delete submissionsState[id]
      notifyListeners()
      return true
    }
    return false
  },

  // Question Management
  addQuestion(quizId: string, question: Omit<QuizQuestion, 'id' | 'questionNumber'>): QuizQuestion | undefined {
    const quiz = quizzesState.find((q) => q.id === quizId)
    if (!quiz) return undefined

    const nextNumber = quiz.questions.length + 1
    const newQ: QuizQuestion = {
      ...question,
      id: `q-${Date.now()}`,
      questionNumber: nextNumber,
    }

    const updatedQuestions = [...quiz.questions, newQ]
    const totalMarks = updatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)

    this.update(quizId, {
      questions: updatedQuestions,
      questionCount: updatedQuestions.length,
      totalMarks,
    })

    return newQ
  },

  updateQuestion(
    quizId: string,
    questionId: string,
    updates: Partial<QuizQuestion>,
  ): QuizQuestion | undefined {
    const quiz = quizzesState.find((q) => q.id === quizId)
    if (!quiz) return undefined

    let updatedQ: QuizQuestion | undefined
    const updatedQuestions = quiz.questions.map((q) => {
      if (q.id === questionId) {
        updatedQ = { ...q, ...updates }
        return updatedQ
      }
      return q
    })

    const totalMarks = updatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)

    this.update(quizId, {
      questions: updatedQuestions,
      totalMarks,
    })

    return updatedQ
  },

  deleteQuestion(quizId: string, questionId: string): boolean {
    const quiz = quizzesState.find((q) => q.id === quizId)
    if (!quiz) return false

    const filtered = quiz.questions
      .filter((q) => q.id !== questionId)
      .map((q, idx) => ({ ...q, questionNumber: idx + 1 }))

    const totalMarks = filtered.reduce((sum, q) => sum + (q.marks || 0), 0)

    this.update(quizId, {
      questions: filtered,
      questionCount: filtered.length,
      totalMarks,
    })

    return true
  },

  duplicateQuestion(quizId: string, questionId: string): QuizQuestion | undefined {
    const quiz = quizzesState.find((q) => q.id === quizId)
    if (!quiz) return undefined

    const original = quiz.questions.find((q) => q.id === questionId)
    if (!original) return undefined

    const cloned: QuizQuestion = {
      ...original,
      id: `q-${Date.now()}`,
      questionText: `${original.questionText} (Copy)`,
      questionNumber: quiz.questions.length + 1,
    }

    const updatedQuestions = [...quiz.questions, cloned]
    const totalMarks = updatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)

    this.update(quizId, {
      questions: updatedQuestions,
      questionCount: updatedQuestions.length,
      totalMarks,
    })

    return cloned
  },

  reorderQuestions(quizId: string, questionIds: string[]): boolean {
    const quiz = quizzesState.find((q) => q.id === quizId)
    if (!quiz) return false

    const questionMap = new Map(quiz.questions.map((q) => [q.id, q]))
    const reordered: QuizQuestion[] = []

    questionIds.forEach((id, index) => {
      const q = questionMap.get(id)
      if (q) {
        reordered.push({ ...q, questionNumber: index + 1 })
      }
    })

    this.update(quizId, { questions: reordered })
    return true
  },

  // Submissions and Grading
  getSubmissions(quizId: string): QuizSubmissionItem[] {
    return submissionsState[quizId] || []
  },

  gradeSubmission(
    submissionId: string,
    quizId: string,
    questionScores: Record<string, { score: number; feedback?: string }>,
  ): QuizSubmissionItem | undefined {
    const subs = submissionsState[quizId] || []
    let updatedSub: QuizSubmissionItem | undefined

    submissionsState[quizId] = subs.map((sub) => {
      if (sub.id === submissionId) {
        let newTotal = 0
        const updatedAnswers = { ...sub.answers }

        Object.entries(questionScores).forEach(([qId, { score, feedback }]) => {
          if (updatedAnswers[qId]) {
            updatedAnswers[qId] = {
              ...updatedAnswers[qId],
              scoreAwarded: score,
              mentorFeedback: feedback || updatedAnswers[qId].mentorFeedback,
              isCorrect: score > 0,
            }
          }
        })

        Object.values(updatedAnswers).forEach((ans) => {
          newTotal += ans.scoreAwarded || 0
        })

        const percentage =
          sub.totalMarks > 0 ? Math.round((newTotal / sub.totalMarks) * 100) : 0

        updatedSub = {
          ...sub,
          score: newTotal,
          percentage,
          status: 'graded',
          answers: updatedAnswers,
        }
        return updatedSub
      }
      return sub
    })

    if (updatedSub) {
      notifyListeners()
    }
    return updatedSub
  },

  resetSubmissionAttempt(quizId: string, submissionId: string): boolean {
    const subs = submissionsState[quizId] || []
    const filtered = subs.filter((s) => s.id !== submissionId)
    submissionsState[quizId] = filtered

    const quiz = quizzesState.find((q) => q.id === quizId)
    if (quiz) {
      this.update(quizId, {
        submissionsCount: Math.max(0, quiz.submissionsCount - 1),
      })
    }

    notifyListeners()
    return true
  },

  getResultSummary(quizId: string): QuizResultSummary {
    const subs = submissionsState[quizId] || []
    if (subs.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
        totalAttempts: 0,
      }
    }

    const scores = subs.map((s) => s.percentage)
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)

    const quiz = quizzesState.find((q) => q.id === quizId)
    const passingPct = quiz?.settings?.passingScore || 60
    const passCount = subs.filter((s) => s.percentage >= passingPct).length
    const passRate = Math.round((passCount / subs.length) * 100)

    return {
      averageScore,
      highestScore,
      lowestScore,
      passRate,
      totalAttempts: subs.length,
    }
  },
}
