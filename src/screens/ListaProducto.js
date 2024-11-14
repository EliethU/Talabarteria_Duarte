import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { appFirebase } from '../../db/firebaseconfig';

export default function ProductList() {
    const db = getFirestore(appFirebase);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchText, setSearchText] = useState('');

    // Obtener productos desde Firestore
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'productos'));
                const productsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(productsList);
                setFilteredProducts(productsList); // Mostrar todos los productos inicialmente
            } catch (error) {
                console.log("Error al obtener los productos: ", error);
            }
        };

        fetchProducts();
    }, []);

    // Filtrar productos según el texto de búsqueda
    useEffect(() => {
        const filtered = products.filter(product =>
            (product.nombre && product.nombre.toLowerCase().includes(searchText.toLowerCase())) ||
            product.precio.toString().includes(searchText)
        );
        setFilteredProducts(filtered);
    }, [searchText, products]);

    // // Función para el botón de "Compra"
    // const handleBuy = (nombre) => {
    //     Alert.alert("Compra realizada", `Has comprado el producto: ${nombre}`);
    // };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Talabarteria Duarte</Text>
            
            {/* Barra de búsqueda */}
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos..."
                value={searchText}
                onChangeText={setSearchText}
            />

            {/* Lista de productos */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        {item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        ) : (
                            <Text>No Image</Text>
                        )}
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <Text style={styles.descripcion}>{item.descripcion}</Text>
                        <Text style={styles.precio}>${item.precio}</Text>
                        {/* <TouchableOpacity 
                            style={styles.buyButton} 
                            onPress={() => handleBuy(item.nombre)}
                        >
                            <Text style={styles.buyButtonText}>Comprar</Text>
                        </TouchableOpacity> */}
                    </View>
                )}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    productCard: {
        flex: 1,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        padding: 10,
        alignItems: 'center',
    },
    image: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: 10,
        marginBottom: 10,
    },
    nombre: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    descripcion: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 10,
    },
    precio: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4f481e',
        marginBottom: 10,
    },
    // buyButton: {
    //     backgroundColor: '#ff5722',
    //     paddingVertical: 10,
    //     paddingHorizontal: 20,
    //     borderRadius: 5,
    //     marginTop: 10,
    // },
    // buyButtonText: {
    //     color: '#fff',
    //     fontWeight: 'bold',
    // },
});
