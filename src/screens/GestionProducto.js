import React, { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, Alert, FlatList, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { appFirebase } from '../../db/firebaseconfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

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
                                    source={{ uri: item.imageUrl || 'defaultImageURL' }}
                                    style={styles.productImage}
                                />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productInfoText}>
                                        <Text style={styles.bold}>Nombre:</Text> {item.nombre}
                                    </Text>
                                    <Text style={styles.productInfoText}>
                                        <Text style={styles.bold}>Descripción:</Text> {item.descripcion}
                                    </Text>
                                    <Text style={styles.productInfoText}>
                                        <Text style={styles.bold}>Precio:</Text> ${item.precio}
                                    </Text>
                                    <Text style={styles.productInfoText}>
                                        <Text style={styles.bold}>Cantidad en stock:</Text> {item.cantidad}
                                    </Text>
                                    <Text style={styles.productInfoText}>
                                        <Text style={styles.bold}>Categoría:</Text> {item.categoria}
                                    </Text>
                                </View>
                            </ScrollView>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => startEditing(item)}>
                                    <Icon name="pencil" size={25} color="orange" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteProduct(item.id)}>
                                    <Icon name="delete" size={25} color="red" />
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
        backgroundColor: '#fdf7e3',
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 20, 
        color: '#2F4F4F',
    },
    input: { 
        borderWidth: 1, 
        borderColor: '#dcdcdc', 
        padding: 12, 
        marginBottom: 12, 
        borderRadius: 8, 
        backgroundColor: '#ffffff',
        elevation: 2, 
    },
    form: { 
        backgroundColor: '#ffffff', 
        padding: 20, 
        borderRadius: 10, 
        elevation: 3, 
        marginBottom: 20, 
    },
    formTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#2E8B57', 
        marginBottom: 10, 
        textAlign: 'center',
    },
    label: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 5, 
        color: '#696969', 
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#dcdcdc',
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#ffffff',
        elevation: 2,
        justifyContent: 'center',
    },
    pickerText: {
        height: 50,
        width: '100%',
        paddingHorizontal: 10,
        color: '#333333',
        fontSize: 16,
    },
    buttonRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 20,
    },
    productRow: { 
        flexDirection: 'row', 
        marginBottom: 20, 
        padding: 10, 
        backgroundColor: '#ffffff', 
        borderRadius: 10, 
        elevation: 3, 
    },
    productImage: { 
        width: 100, 
        height: 100, 
        marginRight: 15, 
        borderRadius: 8, 
    },
    productInfo: { 
        flex: 1, 
        justifyContent: 'center', 
    },
    productInfoText: { 
        fontSize: 16, 
        marginBottom: 5, 
        color: '#333333', 
    },
    bold: { 
        fontWeight: 'bold', 
        color: '#2F4F4F', 
    },
    actions: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-around', 
        marginTop: 10, 
    },
    actionButton: { 
        padding: 10, 
        borderRadius: 8, 
        backgroundColor: '#fff', 
        elevation: 3, 
    },
    actionIcon: { 
        fontSize: 24, 
    },
});
