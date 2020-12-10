// simple and raw implmentation of "filter by keyword"
import { Job } from '../models/Job.interface';

export const jobsByKeyword = (jobs: Job[], keyword: string): Job[] => {
  if (!keyword) return jobs;
  
  return jobs.filter(j => {
    const words = `${j.title}${j.description}`;
    return ~words.toUpperCase().indexOf(keyword.toUpperCase());
  });
};
