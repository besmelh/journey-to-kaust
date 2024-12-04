import React from 'react';
import { X } from 'lucide-react';

const GameCompletionModal = ({
  isOpen,
  onClose,
  score,
  daysCount,
  optimalDays,
  userPath,
  optimalPath,
  startCity,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-gray-500 hover:text-gray-700'
        >
          <X size={24} />
        </button>

        <h2 className='text-3xl font-bold text-center mb-6 text-emerald-700'>
          Congratulations! You've Reached KAUST!
        </h2>

        <div className='space-y-6'>
          <div className='bg-emerald-50 rounded-lg p-4'>
            <h3 className='text-2xl font-bold text-center text-emerald-700 mb-2'>
              Your Score: {score}/100
            </h3>
            <p className='text-center text-gray-600'>
              You completed the journey in {daysCount} days
              {optimalDays && ` (optimal solution: ${optimalDays} days)`}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-gray-50 rounded-lg p-4'>
              <h4 className='font-semibold mb-2'>Your Path</h4>
              <p className='text-sm text-gray-600'>{userPath?.join(' → ')}</p>
            </div>

            <div className='bg-gray-50 rounded-lg p-4'>
              <h4 className='font-semibold mb-2'>Optimal Path</h4>
              <p className='text-sm text-gray-600'>
                {optimalPath?.join(' → ')}
              </p>
            </div>
          </div>

          <div className='flex justify-center mt-6'>
            <button
              onClick={onClose}
              className='bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors'
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCompletionModal;
