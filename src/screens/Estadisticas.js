import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system'; 
import * as Sharing from 'expo-sharing'; 

export default function Estadistica() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore();
            const productosCollection = collection(db, 'productos');
            const snapshot = await getDocs(productosCollection);

            const categorias = {};

            snapshot.forEach((doc) => {
                const producto = doc.data();
                const cantidad = parseFloat(producto.cantidad);

                if (producto.categoria && !isNaN(cantidad) && cantidad > 0) {
                    if (categorias[producto.categoria]) {
                        categorias[producto.categoria] += cantidad;
                    } else {
                        categorias[producto.categoria] = cantidad;
                    }
                }
            });

            const chartData = Object.keys(categorias).map((categoria, index) => ({
                name: categoria,
                cantidad: categorias[categoria],
                color: getColorForCategory(index),
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
            }));

            setData(chartData);
        };

        fetchData();
    }, []);

    const colorPalette = [
        '#8B4513', '#A0522D', '#D2691E', '#C19A6B',
        '#F4A460', '#DEB887', '#D2B48C', '#CD853F',
    ];

    const getColorForCategory = (index) => {
        return colorPalette[index % colorPalette.length];
    };

    const generarPDF = async () => {
        if (data.length === 0) {
            Alert.alert('Advertencia', 'No hay datos disponibles para generar el PDF.');
            return;
        }

        try {
            const doc = new jsPDF();
            doc.text("Reporte de Productos por Categoría", 10, 10);

            let yOffset = 20;
            data.forEach((item) => {
                doc.setTextColor(item.color);
                doc.text(`${item.name}: ${item.cantidad.toFixed(2)} unidades`, 10, yOffset);
                yOffset += 10;
            });

            const pdfBase64 = doc.output('datauristring').split(',')[1];
            const fileUri = `${FileSystem.documentDirectory}reporte_producto.pdf`;

            await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error("Error al generar o compartir el PDF: ", error);
            Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Distribución por categorías</Text>
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

            <View style={styles.buttonContainer}>
                <Button
                    title="Generar y compartir PDF"
                    color="#8B4513"
                    onPress={generarPDF}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fdf7e3',
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#8B4513',
    },
    buttonContainer: {
        marginTop: 20,
        width: '80%',
    },
});
