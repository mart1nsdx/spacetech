import { JobsOptions } from 'bullmq';

export const INGESTION_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
};

export const WEBHOOK_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
};

export const EMBEDDING_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'fixed',
    delay: 3000,
  },
};
