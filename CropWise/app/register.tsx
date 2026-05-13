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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không khớp.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      await register(name.trim(), email.trim(), password);
      
      await logout();
      setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập với tài khoản vừa tạo.');
      
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (error: any) {
      console.error('Register error:', error);
      const code: string | undefined = error?.code;
      switch (code) {
        case 'auth/email-already-in-use':
          setErrorMessage('Email này đã được sử dụng. Vui lòng sử dụng email khác.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Email không hợp lệ.');
          break;
        case 'auth/weak-password':
          setErrorMessage('Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.');
          break;
        case 'auth/operation-not-allowed':
          setErrorMessage('Phương thức đăng ký này không được phép.');
          break;
        default:
          setErrorMessage('Đăng ký thất bại. Vui lòng thử lại.');
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng ký</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.form}>
          <GlassInput
            icon="person-outline"
            placeholder="Họ và tên"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errorMessage) setErrorMessage('');
            }}
            autoCapitalize="words"
          />

          <GlassInput
            icon="mail-outline"
            placeholder="Email"
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
            autoComplete="password-new"
            rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <GlassInput
            icon="lock-closed-outline"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password-new"
          />

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.registerButton,
              (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || loading) &&
                styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || loading}
            activeOpacity={0.7}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.signInLink}>Đăng nhập</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  registerButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  signInLink: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
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
  successContainer: {
    backgroundColor: 'rgba(230, 244, 234, 0.9)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
  },
});
