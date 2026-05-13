import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Đã có lỗi xảy ra', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tôi</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={50} color="#E0E0E0" />
          </View>
          <Text style={styles.userName}>{user?.name || 'Người dùng CropWise'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Chưa có email'}</Text>
        </GlassCard>

        <GlassCard style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-outline" size={24} color="#E0E0E0" />
            </View>
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
            <Ionicons name="chevron-forward" size={24} color="#E0E0E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications-outline" size={24} color="#E0E0E0" />
            </View>
            <Text style={styles.menuText}>Thông báo</Text>
            <Ionicons name="chevron-forward" size={24} color="#E0E0E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="help-circle-outline" size={24} color="#E0E0E0" />
            </View>
            <Text style={styles.menuText}>Trợ giúp</Text>
            <Ionicons name="chevron-forward" size={24} color="#E0E0E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="information-circle-outline" size={24} color="#E0E0E0" />
            </View>
            <Text style={styles.menuText}>Về CropWise</Text>
            <Ionicons name="chevron-forward" size={24} color="#E0E0E0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
              <Ionicons name="log-out-outline" size={24} color="#FF5252" />
            </View>
            <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
            <Ionicons name="chevron-forward" size={24} color="#FF5252" />
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: 15,
    marginTop: 15,
    padding: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  menuContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  logoutText: {
    color: '#FF5252',
    fontWeight: '600',
  },
});
