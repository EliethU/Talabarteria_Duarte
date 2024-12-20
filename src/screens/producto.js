import { View, Text, Button, StyleSheet, Image, ScrollView, TextInput, Alert, useEffect,TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { collection, addDoc, getFirestore } from "firebase/firestore"; 
import * as ImagePicker from 'expo-image-picker';
import { appFirebase } from '../../db/firebaseconfig';
import { Picker } from '@react-native-picker/picker'; 

export default function Product() {
    const db = getFirestore(appFirebase);

    const [product, setProducts] = useState({
        nombre: "",
        descripcion: "",
        cantidad: "",
        precio: "",
        categoria: "",
        imagen: "https://example.com/default-image.png",
    });      

    const [errors, setErrors] = useState({});
    const [image, setImage] = useState(null);

    const establecerEstado = (nombre, value) => {
        setProducts({ ...product, [nombre]: value });
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const validarDatos = () => {
        let valid = true;
        let newErrors = {};
    
        // Verificacion de campos vacíos
        if (!product.nombre.trim()) {
            newErrors.nombre = 'El nombre del producto es obligatorio';
            valid = false;
        }
    
        if (!product.descripcion.trim()) {
            newErrors.descripcion = 'La descripción del producto es obligatoria';
            valid = false;
        }
    
        if (!product.cantidad.trim()) {
            newErrors.cantidad = 'La cantidad es obligatoria';
            valid = false;
        } else if (isNaN(product.cantidad) || parseInt(product.cantidad) <= 0) {
            newErrors.cantidad = 'La cantidad debe ser un número positivo';
            valid = false;
        }
    
        if (!product.precio.trim()) {
            newErrors.precio = 'El precio es obligatorio';
            valid = false;
        } else if (isNaN(product.precio) || parseFloat(product.precio) <= 0) {
            newErrors.precio = 'El precio debe ser un número positivo';
            valid = false;
        }
    
        if (!product.categoria.trim()) {
            newErrors.categoria = 'La categoría es obligatoria';
            valid = false;
        }
    
        setErrors(newErrors);
    
        if (!valid) {
            Alert.alert(
                'Error en los campos',
                'Por favor, completa todos los campos requeridos correctamente.',
                [{ text: 'OK' }]
            );
            return;
        }
    
        // Validacion de imagen
        if (!image) {
            Alert.alert(
                'Imagen requerida',
                'Por favor, selecciona una imagen para el producto.',
                [{ text: 'OK' }]
            );
            return;
        }
    
        guardarProducto({
            ...product,
            cantidad: parseInt(product.cantidad),
            precio: parseFloat(product.precio),
            imageUrl: image || product.imagen,
        });
    
        // Restablecer estado tras guardar
        setProducts({
            nombre: "",
            descripcion: "",
            cantidad: "",
            precio: "",
            categoria: "",
            imagen: "https://example.com/default-image.png",
        });
        setImage(null);
        Alert.alert('Éxito', 'Producto registrado correctamente');
        setErrors({});
    };
    

    const guardarProducto = async (product) => {
        try {
            const docRef = await addDoc(collection(db, "productos"), product);
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Nuevo producto</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre del producto:</Text>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Ingrese el nombre"
                    value={product.nombre}
                    onChangeText={(value) => establecerEstado("nombre", value)}
                />
                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Descripción del producto:</Text>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Ingrese la descripción"
                    value={product.descripcion}
                    onChangeText={(value) => establecerEstado("descripcion", value)}
                />
                {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Categoría:</Text>
                <Picker
                    selectedValue={product.categoria}
                    onValueChange={(itemValue) => establecerEstado("categoria", itemValue)}
                    style={styles.TextInput}
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
                {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Precio:</Text>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Ingrese el precio"
                    value={product.precio}
                    onChangeText={(value) => establecerEstado("precio", value)}
                    keyboardType="numeric"
                />
                {errors.precio && <Text style={styles.errorText}>{errors.precio}</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Cantidad en stock:</Text>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Ingrese la cantidad"
                    value={product.cantidad}
                    onChangeText={(value) => establecerEstado("cantidad", value)}
                    keyboardType="numeric"
                />
                {errors.cantidad && <Text style={styles.errorText}>{errors.cantidad}</Text>}
            </View>

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Seleccionar imagen</Text>
            </TouchableOpacity>

            {image && <Image source={{ uri: image }} style={styles.image} />}

            <TouchableOpacity style={styles.submitButton} onPress={validarDatos}>
                <Text style={styles.submitButtonText}>Registrar producto</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fdf7e3',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#4a3d2f',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    TextInput: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        width: '100%',
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        marginTop: 4,
        fontSize: 14,
    },
    image: {
        width: 150,
        height: 150,
        marginVertical: 10,
        alignSelf: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#b59f5e',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#705b14',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
