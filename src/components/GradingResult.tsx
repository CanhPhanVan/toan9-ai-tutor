'use client'
import MathContent from './MathContent'

interface StepFeedback {
  stepNumber: number
  isCorrect: boolean
  feedback: string
  wrongReason?: string | null
}

interface GradingResultProps {
  result: {
    steps: StepFeedback[]
    overallCorrect: boolean
    correctSolution: {
      method: string
      steps: string[]
      answer: string
    }
    encouragement: string
  }
}

export function GradingResult({ result }: GradingResultProps) {
  const steps = result?.steps ?? []
  const correctSolution = result?.correctSolution
  const correctCount = steps.filter(s => s.isCorrect).length

  if (!result || steps.length === 0) {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
        <p className="text-red-600 font-medium">⚠️ AI chưa trả về kết quả chấm bài.</p>
        <p className="text-sm text-red-400 mt-1">Hãy thử lại hoặc kiểm tra API key trong file .env</p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Overall score */}
      <div className={`rounded-2xl p-5 ${result.overallCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-amber-50 border-2 border-amber-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{result.overallCorrect ? '🎉' : '💪'}</span>
          <div>
            <p className={`font-bold text-lg ${result.overallCorrect ? 'text-green-700' : 'text-amber-700'}`}>
              {result.overallCorrect ? 'Xuất sắc! Bài làm đúng hoàn toàn!' : `Đúng ${correctCount}/${steps.length} bước`}
            </p>
            <p className={`text-sm ${result.overallCorrect ? 'text-green-600' : 'text-amber-600'}`}>
              <MathContent text={result.encouragement} />
            </p>
          </div>
        </div>
      </div>

      {/* Step by step feedback */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Nhận xét từng bước:</h3>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.stepNumber} className={`rounded-xl p-4 ${step.isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{step.isCorrect ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-700 mb-1">Bước {step.stepNumber}</p>
                  <p className={`text-sm ${step.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    <MathContent text={step.feedback} />
                  </p>
                  {!step.isCorrect && step.wrongReason && (
                    <p className="text-xs text-red-500 mt-1.5 bg-red-100 rounded px-2 py-1">
                      ⚠️ <MathContent text={step.wrongReason} />
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correct solution — chỉ hiện khi làm sai */}
      {!result.overallCorrect && correctSolution && (
        <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-5">
          <h3 className="font-semibold text-indigo-700 mb-3">📚 Lời giải chi tiết:</h3>
          <p className="text-xs font-medium text-indigo-500 mb-3">
            Phương pháp: <MathContent text={correctSolution.method} />
          </p>
          <div className="space-y-3">
            {(correctSolution.steps ?? []).map((step, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 font-bold text-indigo-400 w-6">B{i + 1}.</span>
                <span className="text-indigo-900 leading-relaxed"><MathContent text={step} /></span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-200">
            <p className="text-sm font-semibold text-indigo-700">
              ✅ Đáp án: <MathContent text={correctSolution.answer} />
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
