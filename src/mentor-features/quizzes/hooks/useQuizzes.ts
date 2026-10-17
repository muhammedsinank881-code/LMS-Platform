import { useState, useEffect, useCallback } from 'react'
import { quizService } from '../services/quizService'
import type {
  QuizItem,
  QuizKpiStats,
  QuizQuestion,
  QuizResultSummary,
  QuizSubmissionItem,
} from '../types'

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => quizService.getAll())
  const [stats, setStats] = useState<QuizKpiStats>(() => quizService.getStats())

  useEffect(() => {
    const update = () => {
      setQuizzes(quizService.getAll())
      setStats(quizService.getStats())
    }

    const unsubscribe = quizService.subscribe(update)
    return () => {
      unsubscribe()
    }
  }, [])

  const createQuiz = useCallback(
    (data: Omit<QuizItem, 'id' | 'createdAt' | 'submissionsCount' | 'averageScore'>) => {
      return quizService.create(data)
    },
    [],
  )

  const updateQuiz = useCallback((id: string, updates: Partial<QuizItem>) => {
    return quizService.update(id, updates)
  }, [])

  const deleteQuiz = useCallback((id: string) => {
    return quizService.delete(id)
  }, [])

  const getQuizById = useCallback((id: string) => {
    return quizService.getById(id)
  }, [])

  const addQuestion = useCallback(
    (quizId: string, question: Omit<QuizQuestion, 'id' | 'questionNumber'>) => {
      return quizService.addQuestion(quizId, question)
    },
    [],
  )

  const updateQuestion = useCallback(
    (quizId: string, questionId: string, updates: Partial<QuizQuestion>) => {
      return quizService.updateQuestion(quizId, questionId, updates)
    },
    [],
  )

  const deleteQuestion = useCallback((quizId: string, questionId: string) => {
    return quizService.deleteQuestion(quizId, questionId)
  }, [])

  const duplicateQuestion = useCallback((quizId: string, questionId: string) => {
    return quizService.duplicateQuestion(quizId, questionId)
  }, [])

  const reorderQuestions = useCallback((quizId: string, questionIds: string[]) => {
    return quizService.reorderQuestions(quizId, questionIds)
  }, [])

  const getSubmissions = useCallback((quizId: string): QuizSubmissionItem[] => {
    return quizService.getSubmissions(quizId)
  }, [])

  const gradeSubmission = useCallback(
    (
      submissionId: string,
      quizId: string,
      questionScores: Record<string, { score: number; feedback?: string }>,
    ) => {
      return quizService.gradeSubmission(submissionId, quizId, questionScores)
    },
    [],
  )

  const resetAttempt = useCallback((quizId: string, submissionId: string) => {
    return quizService.resetSubmissionAttempt(quizId, submissionId)
  }, [])

  const getResultSummary = useCallback((quizId: string): QuizResultSummary => {
    return quizService.getResultSummary(quizId)
  }, [])

  return {
    quizzes,
    stats,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    getSubmissions,
    gradeSubmission,
    resetAttempt,
    getResultSummary,
  }
}
