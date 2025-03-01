import * as FileSystem from 'expo-file-system'
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native'
import { generateUniqueId } from './helpers'

export async function generateThumbnail(videoUri: string): Promise<string> {
  try {
    // Önce önbellekte bu video için thumbnail var mı kontrol et
    const videoHash = videoUri.split('/').pop() || 'video'
    const thumbnailPath = `${FileSystem.cacheDirectory}thumbnail_${videoHash}.jpg`

    // Thumbnail zaten varsa, onu kullan
    const thumbnailInfo = await FileSystem.getInfoAsync(thumbnailPath)
    if (thumbnailInfo.exists) {
      console.log('Önbellekten thumbnail kullanılıyor:', thumbnailPath)
      return thumbnailPath
    }

    // Yoksa yeni thumbnail oluştur
    const command = `-i "${videoUri}" -ss 00:00:01.000 -vframes 1 -q:v 1 "${thumbnailPath}"`

    console.log('FFmpeg thumbnail komutu:', command)
    const session = await FFmpegKit.execute(command)
    const returnCode = await session.getReturnCode()

    if (ReturnCode.isSuccess(returnCode)) {
      console.log('Thumbnail başarıyla oluşturuldu:', thumbnailPath)
      return thumbnailPath
    } else {
      const logs = await session.getAllLogsAsString()
      console.error('Thumbnail oluşturma hatası:', logs)
      throw new Error('Thumbnail oluşturulamadı')
    }
  } catch (error) {
    console.error('Thumbnail oluşturma hatası:', error)

    // Hata durumunda varsayılan bir görsel döndür
    return 'https://via.placeholder.com/640x360?text=Video+Önizleme'
  }
}
