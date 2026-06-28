export interface RepositoryMetadata {
  path: string;
  packageJson: any | null;
  tsconfigJson: any | null;
  frameworks: string[];
  languages: string[];
  structure: DirectoryStructure;
}

export interface DirectoryStructure {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: DirectoryStructure[];
}
