import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import GlassInput from '../components/ui/GlassInput';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      const code: string | undefined = error?.code;
      switch (code) {
        case 'auth/invalid-email':
          setErrorMessage('Email không hợp lệ.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setErrorMessage('Email hoặc mật khẩu không đúng.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.');
          break;
        case 'auth/user-disabled':
          setErrorMessage('Tài khoản này đã bị vô hiệu hóa.');
          break;
        default:
          setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={80} color="#FFF" />
          <Text style={styles.appName}>CropWise</Text>
          <Text style={styles.tagline}>Cộng đồng Nông dân</Text>
        </View>

        <View style={styles.form}>
          <GlassInput
            icon="mail-outline"
            placeholder="Email hoặc Tên đăng nhập"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <GlassInput
            icon="lock-closed-outline"
            placeholder="Mật khẩu"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!email.trim() || !password.trim() || loading) &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!email.trim() || !password.trim() || loading}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signUpLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: 'rgba(253, 236, 234, 0.9)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  signUpLink: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
});
