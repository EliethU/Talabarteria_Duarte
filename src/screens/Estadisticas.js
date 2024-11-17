import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function Estadistica() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore();
            const productosCollection = collection(db, 'productos');
            const snapshot = await getDocs(productosCollection);

            // Crear un objeto para almacenar la suma de cantidades por categoría
            const categorias = {};

            snapshot.forEach((doc) => {
                const producto = doc.data();
                const cantidad = parseFloat(producto.cantidad);

                if (producto.categoria && !isNaN(cantidad) && cantidad > 0) {
                    // Si la categoría ya existe, suma la cantidad
                    if (categorias[producto.categoria]) {
                        categorias[producto.categoria] += cantidad;
                    } else {
                        // Si la categoría no existe, inicializa con la cantidad
                        categorias[producto.categoria] = cantidad;
                    }
                }
            });

            // Convertir el objeto a un arreglo de datos para el gráfico
            const chartData = Object.keys(categorias).map((categoria, index) => ({
                name: categoria,
                cantidad: categorias[categoria],
                color: getColorForCategory(index),  // Asignar color según el índice
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
            }));

            setData(chartData);
        };

        fetchData();
    }, []);

    // Gama de colores relacionados con la talabartería
    const colorPalette = [
        '#8B4513', // Marrón (cuero)
        '#A0522D', // Marrón oscuro
        '#D2691E', // Marrón chocolate
        '#C19A6B', // Marrón claro
        '#F4A460', // Marrón arena
        '#DEB887', // Beige (madera)
        '#D2B48C', // Marrón claro (paja)
        '#CD853F', // Marrón rojizo
    ];

    const getColorForCategory = (index) => {
        // Usar un color de la paleta para cada categoría
        return colorPalette[index % colorPalette.length];
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Distribución por Categorías</Text>
            {data.length > 0 ? (
                <PieChart
                    data={data}
                    width={Dimensions.get('window').width - 32}
                    height={250}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                    }}
                    accessor="cantidad"
                    backgroundColor="transparent"
                    paddingLeft="15"
                />
            ) : (
                <Text>No se encontraron productos con cantidad válida.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#8B4513',
    },
});
