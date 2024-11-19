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
                        {item.imagen ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        ) : (
                            <Text style={styles.noImageText}>Sin Imagen</Text>
                        )}
                        <Text style={styles.nombre}>{item.nombre ? String(item.nombre) : 'Nombre no disponible'}</Text>
                        <Text style={styles.descripcion}>{item.descripcion ? String(item.descripcion) : 'Descripción no disponible'}</Text>
                        <Text style={styles.precio}>${item.precio ? String(item.precio) : 'Precio no disponible'}</Text>
                        {item.categoria && <Text style={styles.categoria}>{String(item.categoria)}</Text>}
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
        backgroundColor: '#fdf7e3',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#8c4c25',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'serif',
        textTransform: 'uppercase',
    },
    searchInput: {
        height: 45,
        borderColor: '#d4a373',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fffdfa',
        color: '#5a3a2c',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    listContainer: {
        paddingBottom: 20,
    },
    productCard: {
        flex: 1,
        marginVertical: 10,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2c099',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
        padding: 15,
        alignItems: 'center',
        width: '95%',
        alignSelf: 'center',
    },
    image: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: 12,
        marginBottom: 15,
    },
    noImageText: {
        fontSize: 14,
        color: '#d4a373',
        marginBottom: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    nombre: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#5a3a2c',
        marginBottom: 5,
    },
    descripcion: {
        fontSize: 14,
        color: '#8c7c6b',
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    precio: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#8c4c25',
        marginBottom: 10,
    },
    categoria: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#8c7c6b',
    },
});
