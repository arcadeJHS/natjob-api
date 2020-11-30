import { Job } from '../models/Job.interface';

const millisecondsToDays = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  return days;
};

export const jobsByDaysAgo = (jobs: Job[], daysAgo: number = 7): Job[] => { 
  const today = +new Date;
  return jobs.filter(j => {
    return millisecondsToDays(today - +new Date(j.publicationDate)) <= daysAgo;
  });
};
