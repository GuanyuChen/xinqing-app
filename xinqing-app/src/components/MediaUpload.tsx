import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../styles/theme';

interface MediaUploadProps {
  photo?: string;
  audio?: string;
  onPhotoChange: (photo: string | undefined) => void;
  onAudioChange: (audio: string | undefined) => void;
  disabled?: boolean;
  onUploadProgress?: (progress: number) => void;
}

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
`;

const UploadSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const UploadCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.gentle};
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.hover};
  }
`;

const UploadButton = styled(motion.label)<{ $hasContent: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 2px dashed ${props => 
    props.$hasContent ? theme.colors.accent.deepLavender : theme.colors.accent.warmGray
  };
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  background: ${props => 
    props.$hasContent ? `${theme.colors.accent.deepLavender}10` : 'transparent'
  };
  
  &:hover {
    border-color: ${theme.colors.accent.deepLavender};
    background: ${theme.colors.accent.deepLavender}20;
  }
  
  input {
    display: none;
  }
`;

const UploadIcon = styled.div<{ $hasContent: boolean }>`
  font-size: 2rem;
  margin-bottom: ${theme.spacing.sm};
  color: ${props => 
    props.$hasContent ? theme.colors.accent.deepLavender : theme.colors.text.light
  };
  transition: color ${theme.animation.transition.normal};
`;

const UploadText = styled.div<{ $hasContent: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => 
    props.$hasContent ? theme.colors.accent.deepLavender : theme.colors.text.secondary
  };
  text-align: center;
  transition: color ${theme.animation.transition.normal};
`;

const PreviewContainer = styled(motion.div)`
  margin-top: ${theme.spacing.md};
  position: relative;
`;

const PhotoPreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.gentle};
`;

const AudioPreview = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md};
  background: ${theme.colors.gradient.card};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.gentle};
`;

const AudioControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

const PlayButton = styled(motion.button)<{ $isPlaying: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => 
    props.$isPlaying ? theme.colors.mood.anxious : theme.colors.accent.deepLavender
  };
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: background ${theme.animation.transition.normal};
  
  &:hover {
    background: ${props => 
      props.$isPlaying ? theme.colors.mood.angry : theme.colors.accent.softBlue
    };
  }
`;

const AudioWaveform = styled.div`
  flex: 1;
  height: 30px;
  background: ${theme.colors.accent.warmGray};
  border-radius: ${theme.borderRadius.small};
  position: relative;
  overflow: hidden;
`;

const AudioProgress = styled(motion.div)<{ $progress: number }>`
  height: 100%;
  background: ${theme.colors.accent.deepLavender};
  width: ${props => props.$progress}%;
  transition: width 0.1s ease-out;
`;

const RemoveButton = styled(motion.button)`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: ${theme.colors.mood.angry};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  box-shadow: ${theme.shadows.gentle};
  
  &:hover {
    background: ${theme.colors.mood.angry};
    color: white;
  }
`;

const ProgressOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.medium};
  backdrop-filter: blur(5px);
`;

const ProgressBar = styled.div`
  width: 80%;
  height: 4px;
  background: ${theme.colors.accent.warmGray};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${theme.spacing.sm};
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${theme.colors.accent.deepLavender};
  border-radius: 2px;
`;

const MediaUpload: React.FC<MediaUploadProps> = ({
  photo,
  audio,
  onPhotoChange,
  onAudioChange,
  disabled = false,
  onUploadProgress,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, type: 'photo' | 'audio') => {
    if (disabled) return;

    try {
      setUploadProgress(0);
      onUploadProgress?.(0);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 0;
          const next = prev + Math.random() * 30;
          if (next >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          onUploadProgress?.(next);
          return next;
        });
      }, 200);

      // 转换为 base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // 完成上传
      clearInterval(progressInterval);
      setUploadProgress(100);
      onUploadProgress?.(100);

      if (type === 'photo') {
        onPhotoChange(base64);
      } else {
        onAudioChange(base64);
      }

      setTimeout(() => {
        setUploadProgress(null);
        onUploadProgress?.(0);
      }, 1000);

    } catch (error) {
      console.error('文件上传失败:', error);
      setUploadProgress(null);
      onUploadProgress?.(0);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, 'photo');
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      handleFileUpload(file, 'audio');
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioProgress = () => {
    if (!audioRef.current) return;
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setAudioProgress(progress);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const removePhoto = () => {
    onPhotoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAudio = () => {
    onAudioChange(undefined);
    setIsPlaying(false);
    setAudioProgress(0);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  return (
    <Container>
      <Title>添加媒体</Title>
      <Description>可以添加一张照片或录音来丰富你的记录</Description>

      <UploadSection>
        {/* 照片上传 */}
        <UploadCard>
          <UploadButton
            $hasContent={!!photo}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={disabled}
            />
            <UploadIcon $hasContent={!!photo}>
              {photo ? '📷' : '📸'}
            </UploadIcon>
            <UploadText $hasContent={!!photo}>
              {photo ? '已添加照片' : '添加照片'}
            </UploadText>
          </UploadButton>

          <AnimatePresence>
            {photo && (
              <PreviewContainer
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <PhotoPreview src={photo} alt="Mood photo" />
                <RemoveButton
                  onClick={removePhoto}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </RemoveButton>
                {uploadProgress !== null && uploadProgress < 100 && (
                  <ProgressOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span>上传中...</span>
                    <ProgressBar>
                      <ProgressFill
                        style={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </ProgressBar>
                  </ProgressOverlay>
                )}
              </PreviewContainer>
            )}
          </AnimatePresence>
        </UploadCard>

        {/* 音频上传 */}
        <UploadCard>
          <UploadButton
            $hasContent={!!audio}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              disabled={disabled}
            />
            <UploadIcon $hasContent={!!audio}>
              {audio ? '🎵' : '🎤'}
            </UploadIcon>
            <UploadText $hasContent={!!audio}>
              {audio ? '已添加录音' : '添加录音'}
            </UploadText>
          </UploadButton>

          <AnimatePresence>
            {audio && (
              <PreviewContainer
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <AudioPreview>
                  <AudioControls>
                    <PlayButton
                      $isPlaying={isPlaying}
                      onClick={toggleAudio}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </PlayButton>
                    <AudioWaveform>
                      <AudioProgress $progress={audioProgress} />
                    </AudioWaveform>
                  </AudioControls>
                  <audio
                    ref={audioRef}
                    src={audio}
                    onTimeUpdate={handleAudioProgress}
                    onEnded={handleAudioEnded}
                  />
                </AudioPreview>
                <RemoveButton
                  onClick={removeAudio}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </RemoveButton>
                {uploadProgress !== null && uploadProgress < 100 && (
                  <ProgressOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span>上传中...</span>
                    <ProgressBar>
                      <ProgressFill
                        style={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </ProgressBar>
                  </ProgressOverlay>
                )}
              </PreviewContainer>
            )}
          </AnimatePresence>
        </UploadCard>
      </UploadSection>
    </Container>
  );
};

export default MediaUpload;