import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import axios from 'axios';
export const baseURL = 'http://localhost:8080/api/public';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Interceptor adding token:', token); // Debug log
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor để xử lý response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            await AsyncStorage.removeItem('authToken');
            // Có thể thêm logic chuyển hướng đến trang đăng nhập ở đây
        }
        return Promise.reject(error);
    }
);

async function callApi(endpoint, method = "GET", body, params) {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    const config = {
        method,
        url,
        headers: {
            "Content-Type": "application/json",
        },
        data: body ? JSON.stringify(body) : null,
    };

    return api(config)
        .then((response) => response.data)
        .catch((error) => {
            if (error.response && error.response.status === 401) {
                console.error("Unauthorized. Redirecting to login.");
                // Handle unauthorized case
            } else {
                console.error("API call error:", error);
            }
            throw error;
        });
}

export const GET_ALL = async (endpoint, params = {}) => {
    try {
        const paginationParams = {
            pageNumber: params.page || 0,
           // Thay đổi tên tham số từ 'size' thành 'pageSize'
            ...params
        };
        
        console.log("Calling API with params:", paginationParams);
        
        const response = await callApi(endpoint, "GET", null, paginationParams);
        console.log("API Response:", response);
        
        return response;
    } catch (error) {
        console.error("Error in GET_ALL:", error);
        throw error;
    }
};

export function GET_ID(endpoint, id) {
    return callApi(`${endpoint}/${id}`, "GET");
}

export function POST_ADD(endpoint, data) {
    return callApi(endpoint, "POST", data);
}

export function PUT_EDIT(endpoint, data) {
    return callApi(endpoint, "PUT", data);
}

export function DELETE_ID(endpoint) {
    return callApi(endpoint, "DELETE");
}

export function GET_IMG(endpoint, imgName) {
    const imageURL = `http://localhost:8080/api/public/${endpoint}/${imgName}`; // Đảm bảo định dạng đúng
    console.log("Generated Image URL: ", imageURL); // Log URL
    return imageURL;
}

export async function LOGIN(body) {
    const API_URL_LOGIN = "http://localhost:8080/api/login";

    try {
        const response = await axios.post(API_URL_LOGIN, body, {
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            const token = response.data.token || response.data["jwt-token"];
            if (token) {
                await AsyncStorage.setItem("authToken", token);
                console.log('Token saved:', token);
                
                // Kiểm tra token ngay sau khi lưu
                const savedToken = await AsyncStorage.getItem('authToken');
                console.log('Verified saved token:', savedToken);
                
                // Cập nhật headers cho instance api
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                throw new Error("Token not found in response");
            }
        }
        return response;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export function searchProducts(keyword) {
    return callApi(`/products/search?keyword=${keyword}`, "GET");
}



export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`, {
            headers: {
                'accept': '*/*'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        throw error;
    }
};

export async function REGISTER(data, navigate) {
    const API_URL_REGISTER = "http://localhost:8080/api/register";

    const payload = {
        userId: 0,
        firstName: data.firstName,
        lastName: data.lastName,
        mobileNumber: data.mobileNumber,
        email: data.email,
        password: data.password,
        roles: [{ roleId: 0, roleName: data.roleName || "USER" }],
        address: {
            addressId: 0,
            street: data.street || "Default Street",
            buildingName: data.buildingName || "Default Building",
            city: data.city || "Default City",
            state: data.state || "Default State",
            country: data.country || "Default Country",
            pincode: data.pincode || "000000",
        },
        cart: {
            cartId: 0,
            totalPrice: 0,
            products: [{
                productId: 0,
                productName: "Default Product",
                image: "default.png",
                description: "Default Description",
                quantity: 1,
                price: 0,
                discount: 0,
                specialPrice: 0,
                categoryId: 0,
            }],
        },
    };

    try {
        const response = await axios.post(API_URL_REGISTER, payload, {
            headers: { "Content-Type": "application/json" },
        });

        Alert.alert("Success", "Registration successful!");
        navigate("SignIn"); // Use the navigation function for redirect
        return { success: true, message: response.data.message || "Registration successful" };
    } catch (error) {
        const message = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
        Alert.alert("Lỗi", message);
        return { success: false, message };
    }
    
}

// Logout function with navigation
export const logout = async (navigate) => {
    try {
        // Remove token from AsyncStorage
        await AsyncStorage.removeItem('authToken');
        // Clear the authorization header from axios instance
        delete api.defaults.headers.common['Authorization'];
        console.log('User logged out successfully');

        
    } catch (error) {
        console.error("Error during logout:", error);
        Alert.alert("Error", "Failed to log out. Please try again.");
    }
};
export const getCart = async (email, cartId) => {
    try {
        const response = await api.get(`/users/${encodeURIComponent(email)}/carts/${cartId}`, {
            headers: {
                'accept': '*/*'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching cart details:", error);
        throw error;
    }
};


// Thêm hàm kiểm tra token
const checkAndRefreshToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Current token:', token);
    
    if (!token) {
        throw new Error('Vui lòng đăng nhập để tiếp tục');
    }
    
    // Kiểm tra token có hợp lệ không bằng cách gọi API user info
    try {
        const response = await api.get('/users/info', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return token;
    } catch (error) {
        await AsyncStorage.removeItem('authToken');
        throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
    }
};

// Thêm hàm decode JWT
const decodeToken = (token) => {
    try {
        // JWT có cấu trúc: header.payload.signature
        const base64Payload = token.split('.')[1];
        // Decode base64
        const payload = JSON.parse(atob(base64Payload));
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Lấy email từ token
export const getCurrentUserEmail = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('Vui lòng đăng nhập để tiếp tục');
        }

        const decodedToken = decodeToken(token);
        console.log('Decoded token:', decodedToken);

        // Lấy email từ payload của token
        const email = decodedToken.email;
        
        if (!email) {
            throw new Error('Không tìm thấy thông tin email');
        }

        return email;
    } catch (error) {
        console.error('Error getting user email:', error);
        throw error;
    }
};

// Cập nhật hàm getUserInfo để sử dụng email
export const getUserInfo = async () => {
    try {
        const email = await getCurrentUserEmail();
        const response = await api.get(`/users/email/${encodeURIComponent(email)}`, {
            headers: {
                'accept': '*/*'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting user info:', error);
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('authToken');
            throw new Error('Phiên đăng nhập hết hạn');
        }
        throw error;
    }
};
export const getAuthToken = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        return token; // Return the token
    } catch (error) {
        console.error("Error retrieving auth token:", error);
        return null; // Return null if there's an error
    }
};
// Cập nhật hàm addProductToCart để sử dng thông tin user từ email
export async function addProductToCart(productData) {
    try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('Using token:', token);

        if (!token) {
            throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        }

        const userInfo = await getUserInfo();
        const email = await getCurrentUserEmail();
        
        // URL theo đúng format API
        const url = `/carts/${userInfo.cart.cartId}/products/${productData.productId}/quantity/${productData.quantity}`;
        
        // Thực hiện thêm sản phẩm
        await api.post(url, '', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
            }
        });

        // Lấy giỏ hàng mới nhất ngay lập tức
        const updatedCart = await getCurrentCart();  // Thay đổi này để sử dụng getCurrentCart
        
        return {
            success: true,
            message: "Thêm sản phẩm vào giỏ hàng thành công",
            data: updatedCart
        };

    } catch (error) {
        console.error("Error details:", error);
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('authToken');
            throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        }
        throw new Error(error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng");
    }
}

// Cập nhật hàm getCurrentCart để sử dụng email và cartId
export const getCurrentCart = async () => {
    try {
        const userInfo = await getUserInfo();
        const email = await getCurrentUserEmail();
        const response = await api.get(`/users/${encodeURIComponent(email)}/carts/${userInfo.cart.cartId}`);
        
        console.log("Cart response:", response.data);
        
        return response.data;
    } catch (error) {
        console.error("Error fetching current cart:", error);
        throw error;
    }
};
export const deleteCartItem = async (cartId: number, productId: number) => {
    try {
      const response = await api.delete(`/carts/${cartId}/product/${productId}`, {
        headers: {
          'accept': '*/*'
        }
      });
  
      if (response.status === 200) {
        return true;
      }
      throw new Error('Failed to delete cart item');
    } catch (error) {
      console.error('Delete cart item error:', error);
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
        throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      }
      throw new Error('Failed to delete cart item');
    }
  };


// Thêm hàm để lấy đơn hàng của người dùng theo ID
export const getUserOrdersById = async (userId) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('Vui lòng đăng nhập để tiếp tục');
        }

        const response = await api.get(`/users/${userId}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
            }
        });

        return response.data; // Trả về dữ liệu đơn hàng
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }
};
// Thêm hàm để lấy đơn hàng của người dùng theo email và ID đơn hàng
export const getUserOrderByEmailAndId = async (email, orderId) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('Vui lòng đăng nhập để tiếp tục');
        }

        const response = await api.get(`/users/${encodeURIComponent(email)}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
            }
        });

        return response.data; // Trả về dữ liệu đơn hàng
    } catch (error) {
        console.error('Error fetching user order:', error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }
};
// Hàm thanh toán chung
export const Order = async (email, cartId, paymentMethod) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('Vui lòng đăng nhập để tiếp tục');
        }

        const response = await api.post(`/users/${encodeURIComponent(email)}/carts/${cartId}/payments/${paymentMethod}/order`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
            }
        });

        return response.data; // Trả về dữ liệu phản hồi từ server
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }

};
export async function changePassword(userId, newPassword) {
    const API_URL_CHANGE_PASSWORD = `http://localhost:8080/api/public/users/${userId}`;

    // Assuming you have a way to get the user's email and other required fields
    const userInfo = await getUserInfo(); // Fetch user info to get email and other details

    const payload = {
        userId: userId,
        email: userInfo.email, // Include email
        firstName: userInfo.firstName, // Include first name if required
        lastName: userInfo.lastName, // Include last name if required
        mobileNumber: userInfo.mobileNumber, // Include mobile number if required
        password: newPassword, // New password
    };

    console.log('Payload for changing password:', payload); // Log the payload

    try {
        const token = await getAuthToken(); // Get the token
        const response = await axios.put(API_URL_CHANGE_PASSWORD, payload, {
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Include the token here
            },
        });

        if (response.status === 200) {
            console.log('Password changed successfully');
            return { success: true, message: "Password changed successfully" };
        }
    } catch (error) {
        console.error("Error changing password:", error);
        if (error.response) {
            console.error("Response data:", error.response.data); // Log response data
        }
        throw new Error(error.response?.data?.message || "Failed to change password");
    }
};

// Hàm cập nhật hồ sơ người dùng
export const updateUserProfile = async (data) => {
    const API_URL_UPDATE_PROFILE = `http://localhost:8080/api/public/users/${data.userId}`; // Đường dẫn API
 
    // Lấy thông tin người dùng
    const userInfo = await getUserInfo(); // Fetch user info to get email and other details
 
    const payload = {
        userId: data.userId,
        email: userInfo.email, // Bao gồm email
        firstName: data.firstName || userInfo.firstName, // Bao gồm tên
        lastName: data.lastName || userInfo.lastName, // Bao gồm họ
        mobileNumber: data.mobileNumber || userInfo.mobileNumber, // Bao gồm số điện thoại
    };
 
    console.log('Payload for updating profile:', payload); // Log payload
 
    try {
        const response = await api.put(API_URL_UPDATE_PROFILE, payload); // Sử dụng instance api
 
        if (response.status === 200) {
            console.log('Profile updated successfully');
            return { success: true, message: "Profile updated successfully" };
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        if (error.response) {
            console.error("Response data:", error.response.data); // Log response data
            Alert.alert("Lỗi", error.response.data.message || "Cập nhật hồ sơ thất bại");
        } else {
            Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
        }
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    }
};
