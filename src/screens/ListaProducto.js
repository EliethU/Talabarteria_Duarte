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
            console.log('Error al obtener los productos: ', error);
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
            <Text style={styles.title}> 🐴Talabartería Duarte 🐴</Text>
            
            <TextInput
                style={styles.searchInput}
                placeholder="🔍 Buscar por nombre o precio"
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
                        <View style={styles.textContainer}>
                            <Text style={styles.nombre}>{item.nombre}</Text>
                            <Text style={styles.descripcion}>{item.descripcion}</Text>
                            <Text style={styles.precio}>${item.precio}</Text>
                        </View>
                        {item.categoria && (
                            <Text style={styles.categoria}>Categoría: {item.categoria}</Text>
                        )}
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
        backgroundColor: '#f9e4c9',
    },
    title: {
        fontSize:23,
        fontWeight: 'bold',
        color: '#704214',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'serif',
        textTransform: 'uppercase',
    },
    searchInput: {
        height: 45,
        borderColor: '#c49a6c',
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fffaf0',
        color: '#5a3a2c',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    listContainer: {
        paddingBottom: 20,
    },
    productCard: {
        flex: 1,
        marginVertical: 10,
        backgroundColor: '#fff8ed',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#d9a066',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
        padding: 20,
        alignItems: 'center',
        width: '95%',
        alignSelf: 'center',
    },
    image: {
        width: width * 0.65,
        height: width * 0.65,
        borderRadius: 15,
        marginBottom: 15,
        borderColor: '#704214',
        borderWidth: 1,
    },
    noImageText: {
        fontSize: 16,
        color: '#b0835a',
        marginBottom: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    textContainer: {
        alignItems: 'center',
    },
    nombre: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#5a3a2c',
        marginBottom: 8,
    },
    descripcion: {
        fontSize: 16,
        color: '#704214',
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic',
    },
    precio: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8c4c25',
        marginBottom: 10,
    },
    categoria: {
        fontSize: 16,
        color: '#704214',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
