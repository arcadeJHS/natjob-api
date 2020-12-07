export interface Job {
  source: string,               // website name
  sourceUrl: string,            // base website url
  title: string,                // job title, as exposed by the original source
  location: string              // location of the offered job,
  publicationDate: string,      // online since
  url: string,                  // original job link from website
  originalSource: string,       // job original source
  originalSourceJobsUrl: string,   // original source jobs list page
  description: string           // job extended description
}