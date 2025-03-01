export interface Video {
  id: string;
  title: string;
  description: string;
  uri: string;
  trimmedUri?: string;
  duration: number;
  createdAt: number;
  thumbnailUri?: string;
}
