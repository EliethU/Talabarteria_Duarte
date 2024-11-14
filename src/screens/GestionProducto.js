import React, { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, Alert, FlatList, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';  // Asegúrate de importar TextInput aquí
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { appFirebase } from '../..//db/firebaseconfig'; 
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProductManagement() {
    const db = getFirestore(appFirebase);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
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

        fetchProducts();
    }, []);

    const deleteProduct = async (id) => {
        try {
            await deleteDoc(doc(db, 'productos', id));
            setProducts(products.filter(product => product.id !== id));
            setFilteredProducts(filteredProducts.filter(product => product.id !== id));
            Alert.alert("Éxito", "Producto eliminado con éxito");
        } catch (error) {
            console.error("Error al eliminar el producto: ", error);
            Alert.alert("Error", "Hubo un problema al eliminar el producto");
        }
    };

    const startEditing = (product) => {
        setEditingProduct(product);
    };

    const updateProduct = async (product) => {
        try {
            const productRef = doc(db, 'productos', product.id);
            await updateDoc(productRef, product);
            setProducts(products.map(p => p.id === product.id ? product : p));
            setFilteredProducts(filteredProducts.map(p => p.id === product.id ? product : p));
            setEditingProduct(null);
            Alert.alert("Éxito", "Producto actualizado con éxito");
        } catch (error) {
            console.error("Error al actualizar el producto: ", error);
            Alert.alert("Error", "Hubo un problema al actualizar el producto");
        }
    };

    const filterProducts = (text) => {
        setSearchText(text);
        const lowercasedText = text.toLowerCase();
        const filtered = products.filter(product => {
            const matchName = product.nombre.toLowerCase().includes(lowercasedText);
            const matchPrice = product.precio.toString().includes(lowercasedText);
            return matchName || matchPrice;
        });
        setFilteredProducts(filtered);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestión de Productos</Text>

            {/* Barra de búsqueda */}
            <TextInput
                style={styles.input}
                placeholder="Buscar por nombre o precio"
                value={searchText}
                onChangeText={filterProducts}
            />

            {/* Lista de productos */}
            {editingProduct ? (
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Editar producto</Text>
                    <TextInput
                        style={styles.input}
                        value={editingProduct.nombre}
                        onChangeText={(text) => setEditingProduct({ ...editingProduct, nombre: text })}
                    />
                    <TextInput
                        style={styles.input}
                        value={editingProduct.descripcion}
                        onChangeText={(text) => setEditingProduct({ ...editingProduct, descripcion: text })}
                    />
                    <TextInput
                        style={styles.input}
                        value={editingProduct.precio.toString()}
                        onChangeText={(text) => setEditingProduct({ ...editingProduct, precio: parseFloat(text) })}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={editingProduct.cantidad.toString()}
                        onChangeText={(text) => setEditingProduct({ ...editingProduct, cantidad: parseInt(text) })}
                        keyboardType="numeric"
                    />
                    <View style={styles.buttonRow}>
                        <Button title="Actualizar Producto" onPress={() => updateProduct(editingProduct)} />
                        <Button title="Cancelar" onPress={() => setEditingProduct(null)} />
                    </View>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.productRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.productImage}
                                />
                                <View style={styles.productInfo}>
                                    <Text><Text style={styles.bold}>Nombre:</Text> {item.nombre}</Text>
                                    <Text><Text style={styles.bold}>Descripción:</Text> {item.descripcion}</Text>
                                    <Text><Text style={styles.bold}>Precio:</Text> ${item.precio}</Text>
                                    <Text><Text style={styles.bold}>Cantidad en stock:</Text> {item.cantidad}</Text>
                                </View>
                            </ScrollView>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={() => startEditing(item)}>
                                    <Icon name="edit" size={24} color="#4CAF50" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    Alert.alert(
                                        "Confirmar Eliminación",
                                        "¿Estás seguro de que deseas eliminar este producto?",
                                        [
                                            { text: "Cancelar", style: "cancel" },
                                            { text: "Eliminar", onPress: () => deleteProduct(item.id) },
                                        ]
                                    );
                                }}>
                                    <Icon name="delete" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 10,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    productInfo: {
        flex: 1,
        paddingLeft: 10,
    },
    productImage: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bold: {
        fontWeight: 'bold',
    },
    form: {
        marginTop: 20,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    }
});
