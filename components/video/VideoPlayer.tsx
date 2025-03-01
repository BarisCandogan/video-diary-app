import React, { useState, useRef, useEffect } from 'react'
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av'
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
  Platform,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import { generateThumbnail } from '../../utils/video'

interface VideoPlayerProps {
  uri: string
  style?: object
  autoPlay?: boolean
}

export default function VideoPlayer({
  uri,
  style,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [videoExists, setVideoExists] = useState(true)
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    console.log(`[VideoPlayer] URI: ${uri}`)

    // Video dosyasının varlığını kontrol et
    checkVideoFile()

    // Thumbnail yükle
    loadThumbnail()

    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync()
      }
    }
  }, [uri])

  const checkVideoFile = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri)
      console.log(`[VideoPlayer] Video dosya bilgisi:`, fileInfo)

      if (!fileInfo.exists || fileInfo.size === 0) {
        console.error(`[VideoPlayer] Video dosyası bulunamadı veya boş: ${uri}`)
        setVideoExists(false)
        setError('Video dosyası bulunamadı veya bozuk')
      }
    } catch (error) {
      console.error(`[VideoPlayer] Dosya kontrolü hatası:`, error)
    }
  }

  const loadThumbnail = async () => {
    try {
      // Thumbnail oluştur veya önbellekten al
      const thumbUri = await generateThumbnail(uri)
      console.log(`[VideoPlayer] Thumbnail oluşturuldu: ${thumbUri}`)
      setThumbnail(thumbUri)
    } catch (error) {
      console.error('[VideoPlayer] Thumbnail hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    console.log('[VideoPlayer] Status update:', JSON.stringify(playbackStatus))

    if (playbackStatus.isLoaded) {
      setStatus(playbackStatus)
      setIsPlaying(playbackStatus.isPlaying)

      // Video bittiğinde isEnded'i true yap
      if (playbackStatus.didJustFinish) {
        setIsEnded(true)
        setIsPlaying(false)
      }

      if (isLoading) setIsLoading(false)
    } else if (playbackStatus.error) {
      console.error('[VideoPlayer] Playback error:', playbackStatus.error)
      setError(`Video oynatılamadı: ${playbackStatus.error}`)
      setIsLoading(false)
    }
  }

  const handleVideoError = (e) => {
    console.error('[VideoPlayer] Load error:', e)
    setError('Video yüklenirken bir hata oluştu')
    setIsLoading(false)
  }

  const togglePlayback = async () => {
    if (!videoRef.current) return

    try {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync()
      } else {
        await videoRef.current.playAsync()
      }
    } catch (error) {
      console.error('[VideoPlayer] Playback toggle error:', error)
    }
  }

  const handleThumbnailPress = async () => {
    setIsPlaying(true)
    setIsEnded(false)
    try {
      if (videoRef.current) {
        await videoRef.current.playAsync()
      }
    } catch (error) {
      console.error('[VideoPlayer] Play error:', error)
    }
  }

  const handleReplay = async () => {
    setIsEnded(false)
    setIsPlaying(true)
    try {
      if (videoRef.current) {
        await videoRef.current.setPositionAsync(0)
        await videoRef.current.playAsync()
      }
    } catch (error) {
      console.error('[VideoPlayer] Replay error:', error)
    }
  }

  // URI'yi platform bazında düzelt
  let fixedUri = uri
  if (Platform.OS === 'android' && !uri.startsWith('http')) {
    // Android'de file:// öneki gerekebilir
    if (!uri.startsWith('file://')) {
      fixedUri = `file://${uri}`
    }
  }
  console.log(`[VideoPlayer] Düzeltilmiş URI: ${fixedUri}`)

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>Video yükleniyor...</Text>
        </View>
      ) : error || !videoExists ? (
        <View style={styles.errorContainer}>
          <Ionicons name='alert-circle' size={48} color='#FF3B30' />
          <Text style={styles.errorText}>
            {error || 'Video dosyası bulunamadı'}
          </Text>
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              style={styles.errorThumbnail}
              resizeMode='contain'
            />
          ) : null}
        </View>
      ) : (
        <>
          <Video
            ref={videoRef}
            source={{ uri: fixedUri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={handleVideoError}
            shouldPlay={autoPlay}
            isMuted={false}
            volume={1.0}
            isLooping={false}
          />

          {!isPlaying && thumbnail ? (
            <Pressable
              style={styles.thumbnailContainer}
              onPress={isEnded ? handleReplay : handleThumbnailPress}
            >
              <Image
                source={{ uri: thumbnail }}
                style={styles.thumbnail}
                resizeMode='cover'
              />
              <View style={styles.playButtonOverlay}>
                {isEnded ? (
                  <View style={styles.replayContainer}>
                    <Ionicons
                      name='refresh-circle'
                      size={64}
                      color='rgba(255,255,255,0.8)'
                    />
                    <Text style={styles.replayText}>Tekrar İzle</Text>
                  </View>
                ) : (
                  <Ionicons
                    name='play-circle'
                    size={64}
                    color='rgba(255,255,255,0.8)'
                  />
                )}
              </View>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  replayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
  },
  errorThumbnail: {
    width: '80%',
    height: 120,
    marginTop: 16,
    opacity: 0.5,
  },
})
