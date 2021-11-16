export interface CiteTemplate {
  name: string;
  urlParamAliases: string[];
  // archive url
  archiveUrlParam: string;
  archiveUrlParamAliases: string[];
  // archive date
  archiveDateParam: string;
  // dead links
  deadLinkParam?: string;
  deadLinkParamAliases?: string[];
}
