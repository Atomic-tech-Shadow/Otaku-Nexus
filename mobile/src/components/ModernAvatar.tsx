import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ModernAvatarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    username?: string;
  };
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const ModernAvatar: React.FC<ModernAvatarProps> = ({ 
  user, 
  size = 'medium',
  style 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    small: { width: 40, height: 40, fontSize: 16 },
    medium: { width: 60, height: 60, fontSize: 20 },
    large: { width: 80, height: 80, fontSize: 24 }
  };

  const currentSize = sizes[size];

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const hasValidImage = user?.profileImageUrl && !imageError;

  return (
    <View style={[
      styles.container,
      { width: currentSize.width, height: currentSize.height },
      style
    ]}>
      {hasValidImage ? (
        <Image
          source={{ uri: user.profileImageUrl }}
          style={[styles.image, { width: currentSize.width, height: currentSize.height }]}
          onError={() => setImageError(true)}
        />
      ) : (
        <LinearGradient
          colors={['#00D4FF', '#7B68EE']}
          style={[styles.gradient, { width: currentSize.width, height: currentSize.height }]}
        >
          <Text style={[styles.initials, { fontSize: currentSize.fontSize }]}>
            {getInitials()}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  image: {
    borderRadius: 50,
  },
  gradient: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ModernAvatar;