import React, { useState } from 'react';
import { Bot, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { ImprovementStep, ImprovementSession, DEFAULT_LANGUAGE } from '../../types';

interface AIPromptImprovementProps {
  originalQuestion: string;
  onImprovedQuestion: (question: string) => void;
  isLoading?: boolean;
}

interface StepQuestionProps {
  step: ImprovementStep;
  onResponse: (response: string) => void;
  isLastStep: boolean;
}

const StepQuestion: React.FC<StepQuestionProps> = ({ step, onResponse, isLastStep }) => {
  const [response, setResponse] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const handleSubmit = () => {
    const finalResponse = step.type === 'multiple_choice' ? selectedOption : response;
    onResponse(finalResponse);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="font-medium text-slate-900 mb-2">{step.question}</h4>
        
        {step.type === 'multiple_choice' && step.options ? (
          <div className="space-y-2">
            {step.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`step-${step.id}`}
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="text-swiss-red focus:ring-swiss-red"
                />
                <span className="text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="swiss-textarea h-24"
            placeholder="Ihre Antwort hier..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={step.type === 'multiple_choice' ? !selectedOption : !response.trim()}
          className="swiss-button flex items-center space-x-2"
        >
          {isLastStep ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Frage verbessern</span>
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              <span>Weiter</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const AIPromptImprovementInterface: React.FC<AIPromptImprovementProps> = ({ 
  originalQuestion, 
  onImprovedQuestion, 
  isLoading 
}) => {
  const [improvementSession, setImprovementSession] = useState<ImprovementSession | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isImproving, setIsImproving] = useState(false);

  const handleImprovePrompt = async () => {
    setIsImproving(true);
    try {
      const { apiService } = await import('../../services/api');
      const session = await apiService.improvePrompt(originalQuestion, DEFAULT_LANGUAGE);
      setImprovementSession(session);
      setCurrentStep(0);
    } catch (error) {
      console.error('Prompt improvement failed:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleStepResponse = async (response: string) => {
    if (!improvementSession) return;

    try {
      const { apiService } = await import('../../services/api');
      const updatedSession = await apiService.processStepResponse(
        improvementSession.session_id,
        currentStep,
        response
      );

      if (updatedSession.improved_question) {
        // Process complete
        onImprovedQuestion(updatedSession.improved_question);
        setImprovementSession(null);
        setCurrentStep(0);
      } else {
        // Move to next step
        setImprovementSession(updatedSession);
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Step processing failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="swiss-card p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-swiss-red" />
          <span className="text-slate-600">Verbessere Frage...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Question Display */}
      <div className="swiss-card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          📝 Ursprüngliche Frage
        </h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-slate-800">{originalQuestion}</p>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleImprovePrompt}
            disabled={isImproving || !originalQuestion.trim()}
            className="swiss-button flex items-center space-x-2"
          >
            {isImproving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verbessere...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>ImproveAI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Improvement Steps */}
      {improvementSession && (
        <div className="swiss-card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            KI-Verbesserung der Frage
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Schritt {currentStep + 1} von {improvementSession.steps.length}
            </span>
          </h3>
          
          <div className="mb-4">
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / improvementSession.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          {improvementSession.steps[currentStep] && (
            <StepQuestion
              step={improvementSession.steps[currentStep]}
              onResponse={handleStepResponse}
              isLastStep={currentStep === improvementSession.steps.length - 1}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AIPromptImprovementInterface;
