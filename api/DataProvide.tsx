import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
let API_URL = "http://localhost:8080/api";

// Khai báo kiểu cho các tham số và kiểu trả về
interface GetCategoriesParams {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface GetProductsByCategoryParams {
    categoryId: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface AddProductToCartParams {
    cartId: number;
    productId: string;
    quantity: number;
}

interface GetCartByIdParams {
    emailId: string;
    cartId: number;
}

interface UpdateCartQuantityParams {
    cartId: string;
    productId: string;
    newQuantity: number;
}

interface DeleteProductFromCartParams {
    cartId: number;
    productId: number;
}

interface GetOrdersByUserParams {
    emailId: string;
}

interface SearchProductsParams {
    keyword: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Định nghĩa dataProvider với các hàm
export const dataProvider = {
    getCategories: async ({ pageNumber = 1, pageSize = 10, sortBy = 'id', sortOrder = 'asc' }: GetCategoriesParams = {}) => {
        try {
            const response = await axios.get(`${API_URL}/public/categories`, {
                params: { pageNumber, pageSize, sortBy, sortOrder },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`,
                },
            });
            
            return Promise.resolve(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            return Promise.reject(new Error("Không thể lấy danh sách danh mục. Vui lòng thử lại."));
        }
    },

    getProducts: async (pageNumber = 1, pageSize = 10, sortBy = 'id', sortOrder = 'asc') => {
        try {
            const response = await axios.get(`${API_URL}/public/products`, {
                params: { pageNumber, pageSize, sortBy, sortOrder },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`,
                },
            });
            return Promise.resolve(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            return Promise.reject(new Error("Không thể lấy danh sách sản phẩm. Vui lòng thử lại."));
        }
    },

    getProductsByCategory: async ({ categoryId, pageNumber = 1, pageSize = 10, sortBy = 'id', sortOrder = 'asc' }: GetProductsByCategoryParams) => {
        try {
            const response = await axios.get(`${API_URL}/public/categories/${categoryId}/products`, {
                params: { pageNumber, pageSize, sortBy, sortOrder },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`
                },
            });
            return Promise.resolve(response.data);
        } catch (error) {
            console.error("Error fetching products by category:", error);
            return Promise.reject(new Error("Không thể lấy danh sách sản phẩm theo danh mục. Vui lòng thử lại."));
        }
    },

    addProductToCart: async (payload) => {
        try {
            const jwtToken = await AsyncStorage.getItem("authToken");
            const response = await axios.post(
                `${API_URL}/public/carts/${payload.cartId}/products/${payload.products[0].productId}/quantity/${payload.products[0].quantity}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );
            console.log("Phản hồi từ API:", response.data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error.message);
            throw error;
        }
    },

    getCartById: async ({ emailId, cartId }: GetCartByIdParams) => {
        try {
            const jwtToken = await AsyncStorage.getItem("jwt-token");
            const response = await axios.get(
                `${API_URL}/public/users/${emailId}/carts/${cartId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`,
                    },
                }
            );
            return response.data;
        } catch (error:any) {
            console.error("Lỗi khi lấy giỏ hàng:", error.message);
            throw error;
        }
    },

    updateCartQuantity: async ({ cartId, productId, newQuantity }: UpdateCartQuantityParams) => {
        const jwtToken = await AsyncStorage.getItem("jwt-token");
        if (!jwtToken) {
            console.error("Không có jwt-token. Người dùng có thể cần đăng nhập lại.");
            throw new Error("Unauthorized");
        }

        try {
            const response = await axios.put(
                `${API_URL}/public/carts/${cartId}/products/${productId}/quantity/${newQuantity}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );
            return response.data;
        } catch (error:any) {
            console.error("Lỗi khi cập nhật số lượng sản phẩm:", error.message);
            throw error;
        }
    },

    deleteProductFromCart: async ({ cartId, productId }: DeleteProductFromCartParams) => {
        try {
            const response = await axios.delete(
                `${API_URL}/public/carts/${cartId}/product/${productId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`,
                    },
                }
            );
            return response.data;
        } catch (error:any) {
            console.error("Error removing product from cart:", error.response ? error.response.data : error.message);
            throw error;
        }
    },

    getOrdersByUser: async ({ emailId }: GetOrdersByUserParams) => {
        try {
            const response = await axios.get(`${API_URL}/public/users/${emailId}/orders`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`,
                },
            });
            return response.data;
        } catch (error:any) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error.message);
            throw error;
        }
    },
    getProductById: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/public/products/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`,
                },
            });
            return response.data;  // Assuming the API returns the product directly in the data
        } catch (error: any) {
            console.error("Lỗi khi lấy sản phẩm:", error.response ? error.response.data : error.message);
            throw new Error("Không thể lấy thông tin sản phẩm. Vui lòng thử lại."); // Custom error message
        }
    },
    searchProducts: async ({ keyword, pageNumber = 1, pageSize = 10, sortBy = 'id', sortOrder = 'asc' }: SearchProductsParams) => {
        try {
            const response = await axios.get(`${API_URL}/public/products/keyword/${keyword}`, {
                params: { pageNumber, pageSize, sortBy, sortOrder },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await AsyncStorage.getItem("jwt-token")}`,
                },
            });
            return Promise.resolve(response.data);
        } catch (error) {
            console.error("Error searching products:", error);
            return Promise.reject(new Error("Không thể tìm kiếm sản phẩm. Vui lòng thử lại."));
        }
    },
};
