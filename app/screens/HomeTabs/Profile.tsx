import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getUserInfo, logout, updateUserProfile } from "../../../api/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Profile = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserInfo();
        setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await logout(navigation);
      navigation.navigate("SignIn");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUserProfile = async (data) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await api.put(`/users/${data.userId}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        Alert.alert("Lỗi", error.response.data.message || "Cập nhật hồ sơ thất bại");
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
      }
      throw error;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Phần hồ sơ người dùng */}
      <View style={styles.profileContainer}>
        <View style={styles.profileDetails}>
          <Image
            source={require("../../../assets/images/Ellipselogo3.png")}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{userInfo?.firstName} {userInfo?.lastName}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <MaterialCommunityIcons name="cog" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Các mục chức năng */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("UserInfo")}>
          <MaterialCommunityIcons name="account" size={24} color="#0066cc" />
          <Text style={styles.optionText}>Thông tin người dùng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("EditProfile")}>
          <MaterialCommunityIcons name="account-edit" size={24} color="#0066cc" />
          <Text style={styles.optionText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("ChangePassword")}>
          <MaterialCommunityIcons name="lock-reset" size={24} color="#0066cc" />
          <Text style={styles.optionText}>Thay đổi mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#0066cc" />
          <Text style={styles.optionText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileContainer: {
    backgroundColor: "#0066cc",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    margin: 15,
    elevation: 2,
  },
  userInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userInfoValue: {
    fontSize: 16,
    color: "#333",
  },
  optionsContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 2,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
});

export default Profile;
