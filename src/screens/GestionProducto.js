import React, { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, Alert, FlatList, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { appFirebase } from '../../db/firebaseconfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Usaremos MaterialCommunityIcons para íconos relacionados
import { Picker } from '@react-native-picker/picker';  // Cambia aquí la importación

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
            <Text style={styles.title}>Gestión de productos</Text>

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

                    {/* Selector de categoría */}
                    <Text style={styles.label}>Categoría</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={editingProduct.categoria}
                            onValueChange={(itemValue) => setEditingProduct({ ...editingProduct, categoria: itemValue })}
                            style={styles.pickerText}
                        >
                            <Picker.Item label="Seleccione una categoría" value="" />
                            <Picker.Item label="Accesorios de vestimenta" value="vestimenta" />
                            <Picker.Item label="Bolsos/Carteras" value="bolsos" />
                            <Picker.Item label="Articulos de montura" value="montura" />
                            <Picker.Item label="Herramientas/Accesorios para caballos" value="caballos" />
                            <Picker.Item label="Accesorios para herramientas" value="herramientas" />
                            <Picker.Item label="Decoracion para el hogar" value="hogar" />
                            <Picker.Item label="Calzado" value="calzado" />
                            <Picker.Item label="Accesorios personales" value="personales" />
                        </Picker>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button title="Actualizar Producto" color="#A0522D" onPress={() => updateProduct(editingProduct)} />
                        <Button title="Cancelar" color="#8B0000" onPress={() => setEditingProduct(null)} />
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
                                    <Text><Text style={styles.bold}>Categoría:</Text> {item.categoria}</Text> {/* Mostrar categoría */}
                                </View>
                            </ScrollView>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={() => startEditing(item)}>
                                    <Icon name="hammer-screwdriver" size={24} color="#A0522D" />
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
                                    <Icon name="delete" size={24} color="#8B0000" />
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
        backgroundColor: '#F5F5DC', // Beige
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#8B4513', // Marrón oscuro
    },
    input: {
        height: 40,
        borderColor: '#A0522D',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 10,
        backgroundColor: '#FFF',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#8B5E3C', // Color marrón cálido
        borderRadius: 10, // Bordes redondeados
        padding: 10,
        backgroundColor: '#F5F0E1', // Color claro similar al cuero envejecido
        marginTop: 8,
        marginBottom: 12,
    },
    pickerText: {
        fontSize: 16,
        color: '#5D3F1F', // Color oscuro para el texto, tipo cuero
    },
    form: {
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productRow: {
        flexDirection: 'row',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A0522D',
        alignItems: 'center',
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 15,
    },
    productInfo: {
        flex: 1,
    },
    bold: {
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: 100,
    },
});
