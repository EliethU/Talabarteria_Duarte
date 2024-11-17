import { View, Text, Button, StyleSheet, Image, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { collection, addDoc, getFirestore } from "firebase/firestore"; 
import * as ImagePicker from 'expo-image-picker';
import { appFirebase } from '../../db/firebaseconfig';

export default function Product() {
    const db = getFirestore(appFirebase);

    const [product, setProducts] = useState({
        nombre: "",
        descripcion: "",
        cantidad: "",
        precio: "",
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

        if (!image) {
            Alert.alert('Imagen requerida', 'Por favor, selecciona una imagen para el producto.');
            return;
        }

        // Verificar que todos los campos estén llenos
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

        setErrors(newErrors);

        if (valid) {
            guardarProducto({
                ...product,
                cantidad: parseInt(product.cantidad),
                precio: parseFloat(product.precio),
                imageUrl: image || product.imagen,
            });
            setProducts({
                nombre: "",
                descripcion: "",
                cantidad: "",
                precio: "",
                imagen: "https://example.com/default-image.png",
            });
            setImage(null);
            Alert.alert('Éxito', 'Producto registrado correctamente');
            setErrors({});
        }
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
                <Text style={styles.buttonText}>Seleccionar Imagen</Text>
            </TouchableOpacity>

            {image && <Image source={{ uri: image }} style={styles.image} />}

            <TouchableOpacity style={styles.submitButton} onPress={validarDatos}>
                <Text style={styles.submitButtonText}>Registrar Producto</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f7f3e9', // Fondo cálido similar al cuero claro.
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#6b4226', // Tonos marrones oscuros similares al cuero curtido.
        fontFamily: 'serif', // Fuente que evoca un diseño clásico.
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
        color: '#6b4226',
        fontWeight: '600',
    },
    TextInput: {
        borderColor: '#d4a373', // Color similar al costurado de cuero.
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fffbe8', // Fondo cálido que recuerda la artesanía.
        fontFamily: 'sans-serif',
    },
    errorText: {
        color: '#b22222', // Rojo para destacar errores.
        marginTop: 4,
        fontSize: 14,
        fontWeight: 'bold',
    },
    image: {
        width: 150,
        height: 150,
        marginVertical: 10,
        alignSelf: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#6b4226', // Detalles marrones para resaltar.
    },
    button: {
        backgroundColor: '#a5673f', // Marrón cálido.
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        shadowColor: '#000', // Sombra sutil para resaltar el botón.
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fefae0', // Tonos crema.
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
    submitButton: {
        backgroundColor: '#5d3e1e', // Marrón oscuro para acciones importantes.
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff', // Contraste claro.
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
});

