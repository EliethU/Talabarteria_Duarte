import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, FlatList, Image, TextInput, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { appFirebase } from '../../db/firebaseconfig';
import { useFocusEffect } from '@react-navigation/native';

export default function ProductList() {
    const db = getFirestore(appFirebase);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchText, setSearchText] = useState('');

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'productos'));
            const productsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productsList);
            setFilteredProducts(productsList);
        } catch (error) {
            console.log("Error al obtener los productos: ", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchProducts();
        }, [])
    );

    useEffect(() => {
        const filtered = products.filter(product =>
            (product.nombre && product.nombre.toLowerCase().includes(searchText.toLowerCase())) ||
            product.precio.toString().includes(searchText)
        );
        setFilteredProducts(filtered);
    }, [searchText, products]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Talabartería Duarte</Text>
            
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos..."
                placeholderTextColor="#a17c44"
                value={searchText}
                onChangeText={setSearchText}
            />

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        {item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        ) : (
                            <Text style={styles.noImageText}>Sin Imagen</Text>
                        )}
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <Text style={styles.descripcion}>{item.descripcion}</Text>
                        <Text style={styles.precio}>${item.precio}</Text>
                        {item.categoria && <Text style={styles.categoria}>{item.categoria}</Text>}  {/* Aquí mostramos la categoría */}
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
        backgroundColor: '#f8f4ec',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4f2d13',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'serif',
    },
    searchInput: {
        height: 45,
        borderColor: '#a17c44',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fdfaf4',
        color: '#4f2d13',
        marginBottom: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    productCard: {
        flex: 1,
        marginVertical: 10,
        backgroundColor: '#fdf6e3',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#a17c44',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        padding: 15,
        alignItems: 'center',
    },
    image: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: 10,
        marginBottom: 10,
    },
    noImageText: {
        fontSize: 14,
        color: '#a17c44',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    nombre: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#4f2d13',
        marginBottom: 5,
    },
    descripcion: {
        fontSize: 14,
        color: '#7f6a3d',
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    precio: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4f2d13',
        marginBottom: 10,
    },
    categoria: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#7f6a3d',
    },
});
