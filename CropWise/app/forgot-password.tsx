import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email đã đăng ký.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPassword(email.trim());
      setMessage(
        'Firebase đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư và làm theo hướng dẫn.'
      );
    } catch (err: any) {
      console.error('Reset password error:', err);
      const code: string | undefined = err?.code;
      switch (code) {
        case 'auth/invalid-email':
          setError('Email không hợp lệ.');
          break;
        case 'auth/user-not-found':
          setError('Không tìm thấy tài khoản với email này.');
          break;
        default:
          setError('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
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
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quên mật khẩu</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Chúng tôi sẽ gửi một email chứa liên kết đặt lại mật khẩu. Liên kết này do Firebase cung
            cấp, bảo mật và chỉ dùng được một lần.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {error ? (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={styles.alertInfo}>
              <Text style={styles.alertInfoText}>{message}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, (!email.trim() || loading) && styles.submitButtonDisabled]}
            onPress={handleReset}
            disabled={!email.trim() || loading}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang gửi...' : 'Gửi email đặt lại'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToLogin} onPress={() => router.replace('/login')}>
            <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#333',
  },
  description: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  alertError: {
    backgroundColor: '#fdecea',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  alertErrorText: {
    color: '#c62828',
    fontSize: 14,
  },
  alertInfo: {
    backgroundColor: '#e6f4ea',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  alertInfoText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  backToLogin: {
    marginTop: 16,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
});


