import React from 'react';
import { X } from 'lucide-react';

const PartialTravelModal = ({
  isOpen,
  onClose,
  onConfirm,
  destination,
  totalDistance,
  remainingDistance,
  weather,
  remainingHours,
}) => {
  if (!isOpen) return null;

  const speedMultiplier = weather === 'Clear' ? 1 : weather === 'Hot' ? 0.5 : 0;
  const coveredDistance = totalDistance - remainingDistance;
  const progress = (coveredDistance / totalDistance) * 100;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-gray-500 hover:text-gray-700'
        >
          <X size={24} />
        </button>

        <h2 className='text-2xl font-bold text-center mb-6'>
          Partial Travel to {destination}
        </h2>

        <div className='space-y-4'>
          <div className='bg-gray-100 rounded-lg p-4'>
            <div className='mb-2'>
              <span className='font-semibold'>Progress:</span>
              <div className='w-full bg-gray-200 rounded-full h-4 mt-1'>
                <div
                  className='bg-blue-500 rounded-full h-4'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className='text-sm text-gray-600'>
              You can travel {coveredDistance.toFixed(1)} km of the total{' '}
              {totalDistance} km journey with your remaining {remainingHours}{' '}
              hours.
            </p>

            <p className='text-sm text-gray-600 mt-2'>
              Current weather: {weather} (Speed multiplier: {speedMultiplier}x)
            </p>

            <p className='text-sm text-gray-600 mt-2'>
              You must complete this journey before traveling elsewhere.
            </p>
          </div>

          <div className='flex justify-end space-x-4'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:text-gray-800'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              Begin Partial Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartialTravelModal;
