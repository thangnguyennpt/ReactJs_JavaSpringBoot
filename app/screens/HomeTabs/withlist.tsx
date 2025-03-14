import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Wishlist = ({ navigation, route }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const storedWishlist = await AsyncStorage.getItem('wishlist');
        if (storedWishlist) {
          setWishlist(JSON.parse(storedWishlist));
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = async (id) => {
    const updatedWishlist = wishlist.filter(item => item.id !== id);
    setWishlist(updatedWishlist);
    await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    Alert.alert("Thông báo", "Sản phẩm đã được xóa khỏi danh sách yêu thích.");
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={require('../../../assets/images/womensummerdress.png')}
        style={styles.image}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>Jas Oversized</Text>
        <Text style={styles.description}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </Text>
        <Text style={styles.oldPrice}>$8625</Text>
        <Text style={styles.newPrice}>$8625</Text>
        <Text style={styles.discount}>-7%</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.icon} onPress={() => removeFromWishlist(item.id)}>
            <Ionicons name="trash-bin-outline" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <Ionicons name="cart-outline" size={24} color="blue" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Add back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#003399',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  oldPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#666',
  },
  newPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  discount: {
    fontSize: 16,
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  icon: {
    marginHorizontal: 10,
  },
});
