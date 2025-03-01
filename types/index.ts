export interface Video {
  id: string
  title: string
  description: string
  uri: string
  trimmedUri: string
  duration: number
  createdAt: string
}

export interface VideoMetadata {
  title: string
  description: string
}
