import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Cambiado a MaterialCommunityIcons

import Product from '../screens/producto.js';
import productList from '../screens/ListaProducto.js';
import GestionProducto from '../screens/GestionProducto.js';

const Tab = createBottomTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#8B4513', // Marrón oscuro para fondo
                    height: 70, // Altura aumentada
                    borderTopWidth: 0, // Sin borde
                },
                tabBarLabelStyle: {
                    fontSize: 14, // Etiquetas más legibles
                    fontWeight: 'bold',
                    marginBottom: 5,
                    color: '#F5F5DC', // Beige para texto
                },
                tabBarActiveTintColor: '#693820', // Marrón claro para el ícono activo
                tabBarInactiveTintColor: '#F5F5DC', // Beige para íconos inactivos
                headerStyle: {
                    backgroundColor: '#8B4513', // Fondo marrón para encabezados
                },
                headerTintColor: '#F5F5DC', // Texto beige en encabezados
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tab.Screen
                name="Productos"
                component={productList}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="format-list-bulleted" size={size + 4} color={color} />
                    ),
                    title: 'Lista de Productos', // Título en la barra superior
                }}
            />
            <Tab.Screen
                name="Nuevo"
                component={Product}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="plus-circle-outline" size={size + 4} color={color} />
                    ),
                    title: 'Agregar Producto', // Título en la barra superior
                }}
            />
            <Tab.Screen
                name="Gestión"
                component={GestionProducto}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="toolbox" size={size + 4} color={color} />
                    ),
                    title: 'Gestión de Productos', // Título en la barra superior
                }}
            />
        </Tab.Navigator>
    );
}

export default function Navigation() {
    return (
        <NavigationContainer>
            <MyTabs />
        </NavigationContainer>
    );
}
