import { useState, useCallback } from 'react';
import { applicationApi } from '../lib/api';

interface UseApplicationResult {
  isApplying: boolean;
  hasApplied: boolean;
  error: string | null;
  apply: (jobId: string | number, userId: string | number, resumeLink?: string, coverLetter?: string) => Promise<boolean>;
  setHasApplied: (value: boolean) => void;
}

export function useApplication(initialApplied: boolean = false): UseApplicationResult {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(initialApplied);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(
    async (jobId: string | number, userId: string | number, resumeLink?: string, coverLetter?: string): Promise<boolean> => {
      if (hasApplied) {
        setError('You have already applied for this job');
        return false;
      }

      setIsApplying(true);
      setError(null);

      try {
        const response = await applicationApi.applyToJob(jobId, userId, resumeLink, coverLetter);
        if (response.success) {
          setHasApplied(true);
          return true;
        } else {
          setError(response.message || 'Failed to apply for job');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to apply for job';
        setError(errorMessage);
        return false;
      } finally {
        setIsApplying(false);
      }
    },
    [hasApplied]
  );

  return { isApplying, hasApplied, error, apply, setHasApplied };
}
