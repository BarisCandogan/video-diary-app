import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native'
import * as FileSystem from 'expo-file-system'
import { generateUniqueId } from './helpers'
import { Platform } from 'react-native'

export async function trimVideo(
  sourceUri: string,
  startTime: number,
  endTime: number
): Promise<string> {
  try {
    // Temiz bir dosya adı oluştur
    const outputFileName = `trimmed_${generateUniqueId()}.mp4`
    const outputUri = `${FileSystem.documentDirectory}${outputFileName}`

    console.log(`[FFmpeg] Kırpma başlıyor: ${sourceUri}`)
    console.log(`[FFmpeg] Başlangıç: ${startTime}, Bitiş: ${endTime}`)
    console.log(`[FFmpeg] Çıktı: ${outputUri}`)

    // URI'yi platform bazında düzelt
    let fixedSourceUri = sourceUri
    if (Platform.OS === 'android' && sourceUri.startsWith('file:///')) {
      fixedSourceUri = sourceUri.substring(7)
    }

    // Daha güvenilir bir FFmpeg komutu
    // -c:v libx264 ile H.264 codec kullanarak uyumluluk sağla
    // -c:a aac ile ses codec'i belirle
    // -pix_fmt yuv420p ile uyumlu piksel formatı
    const duration = endTime - startTime
    const command = `-i "${fixedSourceUri}" -ss ${startTime} -t ${duration} -c:v libx264 -c:a aac -strict experimental -pix_fmt yuv420p -movflags +faststart "${outputUri}"`

    console.log(`[FFmpeg] Komut: ${command}`)

    // FFmpeg işlemini çalıştır
    const session = await FFmpegKit.execute(command)
    const returnCode = await session.getReturnCode()

    // Log'ları string olarak al
    const logs = await session.getAllLogsAsString()
    console.log(`[FFmpeg] Log çıktısı: ${logs}`)

    if (ReturnCode.isSuccess(returnCode)) {
      // Dosyanın varlığını ve boyutunu kontrol et
      const fileInfo = await FileSystem.getInfoAsync(outputUri)
      console.log(`[FFmpeg] Çıktı dosya bilgisi:`, fileInfo)

      if (fileInfo.exists && fileInfo.size > 0) {
        return outputUri
      } else {
        console.error('[FFmpeg] Dosya oluşturuldu ancak boş veya erişilemez')
        throw new Error(
          'Kırpılan video dosyası oluşturuldu ancak boş veya erişilemez'
        )
      }
    } else {
      console.error(`[FFmpeg] Hata kodu: ${returnCode}`)
      console.error(`[FFmpeg] Hata mesajı: ${logs}`)

      // Alternatif yöntem dene
      return await trimVideoAlternative(fixedSourceUri, startTime, endTime)
    }
  } catch (error) {
    console.error(`[FFmpeg] Hata:`, error)
    throw new Error(`Video kırpma hatası: ${error.message}`)
  }
}

// Alternatif kırpma yöntemi
async function trimVideoAlternative(
  sourceUri: string,
  startTime: number,
  endTime: number
): Promise<string> {
  try {
    console.log(`[FFmpeg] Alternatif kırpma yöntemi deneniyor`)

    const outputFileName = `trimmed_alt_${generateUniqueId()}.mp4`
    const outputUri = `${FileSystem.documentDirectory}${outputFileName}`

    // Farklı bir komut deneyelim - daha basit
    const command = `-i "${sourceUri}" -ss ${startTime} -to ${endTime} -c copy "${outputUri}"`

    console.log(`[FFmpeg] Alternatif komut: ${command}`)

    const session = await FFmpegKit.execute(command)
    const returnCode = await session.getReturnCode()
    const logs = await session.getAllLogsAsString()

    if (ReturnCode.isSuccess(returnCode)) {
      const fileInfo = await FileSystem.getInfoAsync(outputUri)
      if (fileInfo.exists && fileInfo.size > 0) {
        return outputUri
      }
    }

    console.error(`[FFmpeg] Alternatif yöntem de başarısız oldu: ${logs}`)
    throw new Error(`Alternatif kırpma yöntemi başarısız oldu`)
  } catch (error) {
    console.error(`[FFmpeg] Alternatif kırpma hatası:`, error)
    throw new Error(`Alternatif kırpma hatası: ${error.message}`)
  }
}

export async function getVideoDuration(uri: string): Promise<number> {
  try {
    console.log(`[FFmpeg] Video süresi alınıyor: ${uri}`)

    // Sadece süre bilgisini almak için özel komut
    const command = `-i "${uri}"`

    const session = await FFmpegKit.execute(command)
    const logs = await session.getAllLogsAsString()

    console.log(`[FFmpeg] Süre bilgisi log çıktısı: ${logs}`)

    // Regex ile süreyi bul
    const durationMatch = logs.match(/Duration: (\d{2}):(\d{2}):(\d{2}.\d{2})/)
    if (durationMatch) {
      const [, hours, minutes, seconds] = durationMatch
      const duration =
        parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds)
      console.log(`[FFmpeg] Bulunan süre: ${duration} saniye`)
      return duration
    }

    console.warn(`[FFmpeg] Süre bulunamadı, varsayılan değer kullanılıyor`)
    return 0
  } catch (error) {
    console.error(`[FFmpeg] Süre alma hatası:`, error)
    return 0
  }
}

// Video formatını kontrol et ve gerekirse dönüştür
export async function ensureCompatibleFormat(uri: string): Promise<string> {
  try {
    console.log(`[FFmpeg] Video format kontrolü: ${uri}`)

    // Basit bir kontrol - dosya uzantısını kontrol et
    if (uri.toLowerCase().endsWith('.mp4')) {
      console.log(`[FFmpeg] Video formatı uyumlu: ${uri}`)
      return uri
    }

    // Uyumlu değilse MP4'e dönüştür
    const outputFileName = `converted_${generateUniqueId()}.mp4`
    const outputUri = `${FileSystem.documentDirectory}${outputFileName}`

    const command = `-i "${uri}" -c:v libx264 -preset ultrafast -c:a aac "${outputUri}"`

    console.log(`[FFmpeg] Dönüştürme komutu: ${command}`)

    const session = await FFmpegKit.execute(command)
    const returnCode = await session.getReturnCode()
    const logs = await session.getAllLogsAsString()

    if (ReturnCode.isSuccess(returnCode)) {
      console.log(`[FFmpeg] Dönüştürme başarılı: ${outputUri}`)
      return outputUri
    } else {
      console.error(`[FFmpeg] Dönüştürme başarısız: ${logs}`)
      return uri // Başarısız olursa orijinal URI'yi kullan
    }
  } catch (error) {
    console.error(`[FFmpeg] Format kontrolü hatası:`, error)
    return uri
  }
}
