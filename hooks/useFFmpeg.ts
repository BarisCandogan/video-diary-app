import { useMutation } from '@tanstack/react-query'
import {
  trimVideo as trimVideoUtil,
  getVideoDuration as getVideoDurationUtil,
} from '../utils/ffmpeg'

export function useFFmpeg() {
  const trimVideoMutation = useMutation({
    mutationFn: async ({
      sourceUri,
      startTime,
      endTime,
    }: {
      sourceUri: string
      startTime: number
      endTime: number
    }) => {
      console.log('FFmpeg kırpma başlıyor:', { sourceUri, startTime, endTime })
      const result = await trimVideoUtil(sourceUri, startTime, endTime)
      console.log('FFmpeg kırpma sonucu:', result)
      return result
    },
  })

  const getVideoDurationMutation = useMutation({
    mutationFn: async (uri: string) => {
      console.log('FFmpeg süre alınıyor:', uri)
      const result = await getVideoDurationUtil(uri)
      console.log('FFmpeg süre sonucu:', result)
      return result
    },
  })

  return {
    trimVideo: trimVideoMutation,
    getVideoDuration: getVideoDurationMutation,
  }
}
