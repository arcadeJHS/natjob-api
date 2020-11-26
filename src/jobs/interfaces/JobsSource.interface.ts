import { Job } from './Job.interface';

export interface JobsSource {
  name: string,               // website name
  url: string,            // base website url
  results: Job[]
}