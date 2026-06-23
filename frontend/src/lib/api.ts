const API_BASE_URL = 'http://localhost:8080';

// Helper function to get JWT token from localStorage
export function getAuthHeader(): Record<string, string> {
  try {
    const authData = localStorage.getItem('backendAuth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed && parsed.token) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    }
  } catch (e) {
    console.warn('Failed to retrieve auth token from localStorage');
  }
  return {};
}

export const applicationApi = {
  async applyToJob(jobId: string | number, userId: string | number, resumeLink?: string, coverLetter?: string) {
    const payload: Record<string, unknown> = {
      job_id: jobId,
      seeker_id: userId,
      jobId,
      userId,
    };

    if (resumeLink) {
      payload.resume_link = resumeLink;
      payload.resumeLink = resumeLink;
    }
    if (coverLetter) {
      payload.cover_letter = coverLetter;
      payload.coverLetter = coverLetter;
    }

    const response = await fetch(`${API_BASE_URL}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      // send snake_case keys expected by backend plus camelCase for compatibility
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply for job');
    }

    return response.json();
  },

  async getUserApplications(userId: string | number) {
    const response = await fetch(`${API_BASE_URL}/applications/user/${userId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch applications');
    }

    return response.json();
  },

  async checkIfApplied(jobId: string | number, userId: string | number) {
    try {
      const data = await this.getUserApplications(userId);
      if (data.applications) {
        return data.applications.some((app: { job_id: number | string }) => 
          Number(app.job_id) === Number(jobId)
        );
      }
      return false;
    } catch {
      return false;
    }
  },
};
